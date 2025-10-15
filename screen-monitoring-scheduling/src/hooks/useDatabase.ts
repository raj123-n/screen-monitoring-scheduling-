import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  saveActivity,
  saveWellnessSession,
  subscribeToUserActivities,
  subscribeToUserSessions,
  subscribeToUserProfile,
  getUserStats,
  updateUserStats,
  UserProfile,
  UserActivity,
  WellnessSession
} from '../lib/database';

export const useDatabase = () => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [sessions, setSessions] = useState<WellnessSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user profile on mount and subscribe realtime
  useEffect(() => {
    if (!currentUser) return;
    loadUserProfile();
    const unsubscribe = subscribeToUserProfile(currentUser.uid, (profile) => {
      if (profile) setUserProfile(profile);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [currentUser]);

  // Subscribe to real-time data
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeActivities: (() => void) | null = null;
    let unsubscribeSessions: (() => void) | null = null;

    try {
      // Subscribe to user activities
      unsubscribeActivities = subscribeToUserActivities(currentUser.uid, (newActivities) => {
        setActivities(newActivities);
      });

      // Subscribe to user sessions
      unsubscribeSessions = subscribeToUserSessions(currentUser.uid, (newSessions) => {
        setSessions(newSessions);
      });
    } catch (err) {
      console.error('Error setting up database subscriptions:', err);
      setError('Failed to load real-time data');
    }

    // Cleanup subscriptions
    return () => {
      if (unsubscribeActivities) unsubscribeActivities();
      if (unsubscribeSessions) unsubscribeSessions();
    };
  }, [currentUser]);

  const loadUserProfile = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      const profile = await getUserProfile(currentUser.uid);

      if (profile) {
        setUserProfile(profile);
        return;
      }

      // Create default profile for new users or when DB read fails/returns null
      const defaultProfile: UserProfile = {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'User',
        email: currentUser.email || '',
        photoURL: '',
        bio: '',
        location: '',
        gender: 'prefer_not_to_say',
        // omit undefined numeric fields entirely to satisfy Firestore
        profession: '',
        preferences: {
          workSessionDuration: 25,
          breakDuration: 5,
          notifications: true,
          weatherBasedSuggestions: true,
        },
        stats: {
          totalWorkTime: 0,
          totalBreakTime: 0,
          sessionsCompleted: 0,
          lastActive: Date.now(),
        },
      };

      try {
        await createUserProfile(defaultProfile);
      } catch (createErr) {
        console.warn('Proceeding with local default profile due to DB create failure:', createErr);
      }
      setUserProfile(defaultProfile);
    } catch (err) {
      console.error('Error loading user profile:', err);
      // Proceed with local default profile so dashboard can render
      const fallbackProfile: UserProfile = {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'User',
        email: currentUser.email || '',
        photoURL: '',
        bio: '',
        location: '',
        gender: 'prefer_not_to_say',
        profession: '',
        preferences: {
          workSessionDuration: 25,
          breakDuration: 5,
          notifications: true,
          weatherBasedSuggestions: true,
        },
        stats: {
          totalWorkTime: 0,
          totalBreakTime: 0,
          sessionsCompleted: 0,
          lastActive: Date.now(),
        },
      };
      setUserProfile(fallbackProfile);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;

    try {
      setLoading(true);
      setError(null);
      const sanitize = (obj: any): any => {
        if (obj == null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(sanitize);
        const out: any = {};
        for (const [k, v] of Object.entries(obj)) {
          if (v === undefined) continue; // strip undefined which may break RTDB updates
          out[k] = sanitize(v);
        }
        return out;
      };
      const cleaned = sanitize(updates);
      await updateUserProfile(currentUser.uid, cleaned);
      setUserProfile({ ...userProfile, ...cleaned });
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser, userProfile]);

  const saveUserActivity = useCallback(async (activity: Omit<UserActivity, 'userId' | 'timestamp'>) => {
    if (!currentUser) return;

    try {
      // Do not set global error for background activity writes
      const fullActivity: UserActivity = {
        ...activity,
        userId: currentUser.uid,
        timestamp: Date.now(),
      };
      
      await saveActivity(fullActivity);
    } catch (err) {
      console.error('Error saving activity:', err);
      // swallow to avoid taking over the entire page; caller may handle
      // throw err;
    }
  }, [currentUser]);

  const saveSession = useCallback(async (session: Omit<WellnessSession, 'userId' | 'sessionId' | 'startTime'>) => {
    if (!currentUser) return;

    try {
      // Non-fatal on background persistence
      const fullSession: WellnessSession = {
        ...session,
        userId: currentUser.uid,
        sessionId: `session_${Date.now()}`,
        startTime: Date.now(),
      };
      
      await saveWellnessSession(fullSession);
    } catch (err) {
      console.error('Error saving session:', err);
      // swallow
    }
  }, [currentUser]);

  const updateUserStatistics = useCallback(async (stats: Partial<UserProfile['stats']>) => {
    if (!currentUser) return;

    try {
      await updateUserStats(currentUser.uid, stats);
      
      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          stats: { ...userProfile.stats, ...stats }
        });
      }
    } catch (err) {
      console.error('Error updating statistics:', err);
      // swallow
    }
  }, [currentUser, userProfile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    userProfile,
    activities,
    sessions,
    loading,
    error,
    
    // Actions
    loadUserProfile,
    updateProfile,
    saveUserActivity,
    saveSession,
    updateUserStatistics,
    clearError,
    
    // Computed values
    totalWorkTime: userProfile?.stats.totalWorkTime || 0,
    totalBreakTime: userProfile?.stats.totalBreakTime || 0,
    sessionsCompleted: userProfile?.stats.sessionsCompleted || 0,
    workSessionDuration: userProfile?.preferences.workSessionDuration || 25,
    breakDuration: userProfile?.preferences.breakDuration || 5,
  };
};

import { ref, set, get, push, update, remove, onValue, off, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
import { database, db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

// Database utility functions for WellnessAI

// User Activity Data Structure
export interface UserActivity {
  userId: string;
  timestamp: number;
  activityType: 'work' | 'break' | 'wellness' | 'idle' | 'away' | 'visibility';
  duration: number; // in minutes
  details?: {
    mouseMovements?: number;
    clicks?: number;
    scrolls?: number;
    productivity?: number;
    averageVelocity?: number;
    visible?: boolean;
    focused?: boolean;
    events?: number;
  };
}

// Wellness Session Data
export interface WellnessSession {
  userId: string;
  sessionId: string;
  startTime: number;
  endTime?: number;
  workDuration: number;
  breakDuration: number;
  weatherData?: {
    temperature: number;
    condition: string;
    humidity: number;
  };
  foodSuggestions?: string[];
  activities?: string[];
}

// User Profile Data
export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  heightCm?: number;
  weightKg?: number;
  age?: number;
  profession?: string;
  preferences: {
    workSessionDuration: number; // default 25 minutes
    breakDuration: number; // default 5 minutes
    notifications: boolean;
    weatherBasedSuggestions: boolean;
  };
  stats: {
    totalWorkTime: number;
    totalBreakTime: number;
    sessionsCompleted: number;
    lastActive: number;
  };
}

// Database Operations

// Create or update user profile
// Remove undefined recursively to satisfy Firestore constraints
const sanitizeForFirestore = (obj: any): any => {
  if (obj == null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[k] = sanitizeForFirestore(v);
  }
  return out;
};

export const createUserProfile = async (userProfile: UserProfile): Promise<void> => {
  try {
    const cleaned = sanitizeForFirestore(userProfile);
    await setDoc(doc(db, 'users', userProfile.userId), cleaned, { merge: true });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const d = await getDoc(doc(db, 'users', userId));
    return d.exists() ? (d.data() as UserProfile) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const cleaned = sanitizeForFirestore(updates);
    // Use setDoc with merge to create-or-update safely
    await setDoc(doc(db, 'users', userId), cleaned as any, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Subscribe to user profile realtime updates
export const subscribeToUserProfile = (
  userId: string,
  callback: (profile: UserProfile | null) => void
): (() => void) => {
  const unsubscribe = onSnapshot(doc(db, 'users', userId), (snap) => {
    callback(snap.exists() ? (snap.data() as UserProfile) : null);
  });
  return unsubscribe;
};

// Save activity data
export const saveActivity = async (activity: UserActivity): Promise<string> => {
  try {
    const newActivityRef = push(ref(database, 'activities'));
    await set(newActivityRef, activity);
    return newActivityRef.key!;
  } catch (error) {
    console.error('Error saving activity:', error);
    throw error;
  }
};

// Save wellness session
export const saveWellnessSession = async (session: WellnessSession): Promise<string> => {
  try {
    const newSessionRef = push(ref(database, 'wellnessSessions'));
    await set(newSessionRef, session);
    return newSessionRef.key!;
  } catch (error) {
    console.error('Error saving wellness session:', error);
    throw error;
  }
};

// Get user activities (realtime listener)
export const subscribeToUserActivities = (
  userId: string, 
  callback: (activities: UserActivity[]) => void
): (() => void) => {
  const activitiesRef = query(
    ref(database, 'activities'),
    orderByChild('userId'),
    equalTo(userId),
    limitToLast(50)
  );

  const unsubscribe = onValue(activitiesRef, (snapshot) => {
    const activities: UserActivity[] = [];
    snapshot.forEach((childSnapshot) => {
      activities.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    callback(activities.reverse()); // Most recent first
  });

  return unsubscribe;
};

// Get user wellness sessions (realtime listener)
export const subscribeToUserSessions = (
  userId: string, 
  callback: (sessions: WellnessSession[]) => void
): (() => void) => {
  const sessionsRef = query(
    ref(database, 'wellnessSessions'),
    orderByChild('userId'),
    equalTo(userId),
    limitToLast(20)
  );

  const unsubscribe = onValue(sessionsRef, (snapshot) => {
    const sessions: WellnessSession[] = [];
    snapshot.forEach((childSnapshot) => {
      sessions.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    callback(sessions.reverse()); // Most recent first
  });

  return unsubscribe;
};

// Update session end time
export const endWellnessSession = async (sessionId: string, endTime: number): Promise<void> => {
  try {
    await update(ref(database, `wellnessSessions/${sessionId}`), {
      endTime,
      duration: endTime - (await get(ref(database, `wellnessSessions/${sessionId}/startTime`))).val()
    });
  } catch (error) {
    console.error('Error ending wellness session:', error);
    throw error;
  }
};

// Get user statistics
export const getUserStats = async (userId: string): Promise<UserProfile['stats'] | null> => {
  try {
    const snapshot = await get(ref(database, `users/${userId}/stats`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

// Update user statistics
export const updateUserStats = async (userId: string, stats: Partial<UserProfile['stats']>): Promise<void> => {
  try {
    await update(ref(database, `users/${userId}/stats`), stats);
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

// Cleanup function for removing listeners
export const cleanupDatabaseListeners = (): void => {
  // This will be called when components unmount
  // Individual components should store and call their unsubscribe functions
};

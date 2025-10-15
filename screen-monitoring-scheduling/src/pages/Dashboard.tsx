import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Brain, 
  Coffee, 
  Heart, 
  Clock, 
  TrendingUp, 
  Target, 
  Zap,
  Calendar,
  Bell,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Thermometer,
  Droplets,
  Apple,
  Eye,
  Utensils,
  Dumbbell
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useScreenTime } from "@/contexts/ScreenTimeContext";
import { useTimer } from "@/contexts/TimerContext";
import { useDatabase } from "@/hooks/useDatabase";
import { WorkSessionTimer } from "@/components/WorkSessionTimer";
// import { AIChatBot } from "@/components/AIChatBot";
import { toast } from "sonner";

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const { getActivityStats, activityData } = useActivityTracker();
  const { 
    userProfile, 
    activities, 
    sessions, 
    loading, 
    error,
    totalWorkTime,
    totalBreakTime,
    sessionsCompleted,
    workSessionDuration,
    breakDuration,
    updateProfile,
    saveUserActivity,
    saveSession,
    updateUserStatistics
  } = useDatabase();
  const { todayActiveSeconds } = useScreenTime();
  const { phase, isActive, breakDurationSeconds, timeLeftSeconds, workDurationSeconds } = useTimer();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyGoal, setDailyGoal] = useState(8); // hours
  const [productivityScore, setProductivityScore] = useState(85);
  const [wellnessScore, setWellnessScore] = useState(78);

  const stats = getActivityStats();

  // Build Recent Activity strictly from Work Session Timer (work/break segments)
  type TimerSegment = { kind: 'work' | 'break'; startMs: number; endMs?: number };
  const [recentTimerSegments, setRecentTimerSegments] = useState<TimerSegment[]>([]);
  const lastPhaseRef = useRef<'work' | 'break'>(phase);
  const lastActiveRef = useRef<boolean>(isActive);

  // On mount, if a timer is already running, seed an open segment from elapsed time
  useEffect(() => {
    const base = phase === 'work' ? workDurationSeconds : breakDurationSeconds;
    const elapsed = base - timeLeftSeconds; // seconds
    if (isActive && elapsed >= 0) {
      const startMs = Date.now() - elapsed * 1000;
      setRecentTimerSegments((prev) => [{ kind: phase, startMs }, ...prev]);
    }
    lastPhaseRef.current = phase;
    lastActiveRef.current = isActive;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track timer transitions to append/close segments
  useEffect(() => {
    const prevPhase = lastPhaseRef.current;
    const prevActive = lastActiveRef.current;
    const now = Date.now();

    // Phase change while active: close previous, open new
    if (isActive && prevActive && phase !== prevPhase) {
      setRecentTimerSegments((prev) => {
        const closed = prev.length > 0 && prev[0].endMs == null ? [{ ...prev[0], endMs: now }, ...prev.slice(1)] : prev;
        return [{ kind: phase, startMs: now }, ...closed].slice(0, 10);
      });
    }

    // Became active: open segment
    if (!prevActive && isActive) {
      setRecentTimerSegments((prev) => [{ kind: phase, startMs: now }, ...prev].slice(0, 10));
    }

    // Became inactive: close open segment
    if (prevActive && !isActive) {
      setRecentTimerSegments((prev) => prev.length > 0 && prev[0].endMs == null ? [{ ...prev[0], endMs: now }, ...prev.slice(1)] : prev);
    }

    lastPhaseRef.current = phase;
    lastActiveRef.current = isActive;
  }, [phase, isActive]);

  // Ticker to update durations for the currently open segment
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((t) => (t + 1) % 1_000_000), 1000);
    return () => clearInterval(id);
  }, []);

  // Update clock every second for UI smoothness and recomputations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time productivity and wellness derived each second from activity + timer state
  useEffect(() => {
    const interval = setInterval(() => {
      const s = getActivityStats();
      // Productivity: scale events/min and penalize idle/high velocity noise
      const activityRate = Math.min(120, s.eventsLastMinute); // cap
      const base = Math.floor((activityRate / 120) * 95);
      const idlePenalty = s.isCurrentlyIdle ? 25 : 0;
      const velocityPenalty = Math.min(20, Math.floor((s.averageVelocity || 0) * 60));
      const currentProductivity = Math.max(0, Math.min(100, base - idlePenalty - velocityPenalty));
      setProductivityScore(currentProductivity);

      // Wellness: balanced metric of productivity, break adherence, and focus steadiness
      const onBreak = isActive && phase === 'break';
      const currentBreakElapsed = onBreak ? Math.max(0, breakDurationSeconds - timeLeftSeconds) : 0;
      const breakPct = breakDurationSeconds > 0 ? Math.min(1, currentBreakElapsed / breakDurationSeconds) : 0;
      const activityBalance = 1 - Math.min(1, Math.abs(currentProductivity - 70) / 70);
      const wellness = Math.round(
        0.5 * (currentProductivity) +          // productivity contributes 50%
        0.3 * (breakPct * 100) +               // taking the current break contributes up to 30%
        0.2 * (activityBalance * 100)          // steadiness contributes 20%
      );
      setWellnessScore(Math.max(0, Math.min(100, wellness)));
    }, 1000);
    return () => clearInterval(interval);
  }, [getActivityStats, isActive, phase, breakDurationSeconds, timeLeftSeconds]);

  // Derive today totals for display
  // Work time: accumulate only when timer is active AND in 'work' phase
  const WORK_STORAGE_KEY = 'breeze-work-time-today-v1';
  const [workDayMs, setWorkDayMs] = useState<number>(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d.getTime();
  });
  const [todayWorkSeconds, setTodayWorkSeconds] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(WORK_STORAGE_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw) as { day?: number; seconds?: number };
      const today = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
      if ((parsed.day ?? today) !== today) return 0;
      return parsed.seconds ?? 0;
    } catch { return 0; }
  });
  useEffect(() => {
    const interval = setInterval(() => {
      const today = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
      if (today !== workDayMs) {
        setWorkDayMs(today);
        setTodayWorkSeconds(0);
        try { localStorage.setItem(WORK_STORAGE_KEY, JSON.stringify({ day: today, seconds: 0 })); } catch {}
      }
      const onWork = isActive && phase === 'work';
      if (onWork) {
        setTodayWorkSeconds((s) => {
          const next = s + 1;
          try { localStorage.setItem(WORK_STORAGE_KEY, JSON.stringify({ day: today, seconds: next })); } catch {}
          return next;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, phase, workDayMs]);
  const currentBreakSeconds = useMemo(() => {
    const onBreak = isActive && phase === 'break';
    return onBreak ? Math.max(0, breakDurationSeconds - timeLeftSeconds) : 0;
  }, [isActive, phase, breakDurationSeconds, timeLeftSeconds]);

  // Persisted per-day break accumulator that does not reset when timer resets
  const BREAK_STORAGE_KEY = 'breeze-break-time-today-v1';
  const [breakDayMs, setBreakDayMs] = useState<number>(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d.getTime();
  });
  const [breakTodaySeconds, setBreakTodaySeconds] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(BREAK_STORAGE_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw) as { day?: number; seconds?: number };
      const today = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
      if ((parsed.day ?? today) !== today) return 0;
      return parsed.seconds ?? 0;
    } catch { return 0; }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const today = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
      if (today !== breakDayMs) {
        setBreakDayMs(today);
        setBreakTodaySeconds(0);
        try { localStorage.setItem(BREAK_STORAGE_KEY, JSON.stringify({ day: today, seconds: 0 })); } catch {}
      }
      const onBreak = isActive && phase === 'break';
      if (onBreak) {
        setBreakTodaySeconds((s) => {
          const next = s + 1;
          try { localStorage.setItem(BREAK_STORAGE_KEY, JSON.stringify({ day: today, seconds: next })); } catch {}
          return next;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, phase, breakDayMs]);

  const formatHM = (totalMinutes: number) => {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    return `${hrs}h ${mins}m`;
  };
  const formatHMS = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  // Update preferences when they change
  const handlePreferenceUpdate = async (updates: any) => {
    try {
      await updateProfile({
        preferences: {
          ...userProfile?.preferences,
          ...updates
        }
      });
      toast.success("Preferences updated successfully!");
    } catch (err) {
      toast.error("Failed to update preferences");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getProductivityStatus = () => {
    if (productivityScore >= 90) return { text: "Excellent", color: "text-green-500", bg: "bg-green-500/10" };
    if (productivityScore >= 75) return { text: "Good", color: "text-blue-500", bg: "bg-blue-500/10" };
    if (productivityScore >= 60) return { text: "Fair", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    return { text: "Needs Improvement", color: "text-red-500", bg: "bg-red-500/10" };
  };

  const getWellnessStatus = () => {
    if (wellnessScore >= 85) return { text: "Excellent", color: "text-green-500", bg: "bg-green-500/10" };
    if (wellnessScore >= 70) return { text: "Good", color: "text-blue-500", bg: "bg-blue-500/10" };
    if (wellnessScore >= 55) return { text: "Fair", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    return { text: "Needs Attention", color: "text-red-500", bg: "bg-red-500/10" };
  };

  // Determine if user is brand-new: no sessions/activities and zero stats today
  const isNewUser = useMemo(() => {
    const noDbData = (!sessions || sessions.length === 0) && (!activities || activities.length === 0);
    const noStats = (userProfile?.stats?.sessionsCompleted ?? 0) === 0 && (userProfile?.stats?.totalWorkTime ?? 0) === 0 && (userProfile?.stats?.totalBreakTime ?? 0) === 0;
    const noTodayRuntime = (todayWorkSeconds === 0) && (breakTodaySeconds === 0) && (recentTimerSegments.length === 0);
    return noDbData && noStats && noTodayRuntime;
  }, [sessions, activities, userProfile, todayWorkSeconds, breakTodaySeconds, recentTimerSegments]);

  // Persist minute-by-minute activity for Recent Activity
  useEffect(() => {
    let lastMinuteStamp = 0;
    const interval = setInterval(async () => {
      const now = Date.now();
      const minuteBucket = Math.floor(now / 60000);
      if (minuteBucket === lastMinuteStamp) return;
      lastMinuteStamp = minuteBucket;

      const s = getActivityStats();
      const isVisible = !document.hidden && document.hasFocus();
      const active = isVisible && !s.isCurrentlyIdle && s.eventsLastMinute > 0;
      const onBreak = isActive && phase === 'break';

      try {
        await saveUserActivity({
          activityType: onBreak ? 'break' : (active ? 'work' : 'idle'),
          duration: 1,
          details: {
            mouseMovements: s.mouseMovesLastMinute,
            clicks: s.clicksLastMinute,
            scrolls: s.scrollsLastMinute,
            productivity: productivityScore,
            averageVelocity: s.averageVelocity,
            visible: isVisible,
            focused: document.hasFocus(),
            events: s.eventsLastMinute,
          }
        });
      } catch (e) {
        // non-blocking
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getActivityStats, isActive, phase, productivityScore]);

  // Show loading state
  if (loading && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/profile" className="block">
                <img
                  src={userProfile?.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userProfile?.displayName || currentUser?.email || 'User')}`}
                  alt="Avatar"
                  className="h-10 w-10 rounded-full object-cover border"
                />
              </Link>
              <h1 className="text-2xl font-bold">WellnessAI Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {userProfile?.displayName || currentUser?.displayName || 'User'}!
              </span>
              <Link to="/">
                <Button variant="secondary" size="sm">
                  Home
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Greeting and Time */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {getGreeting()}, {userProfile?.displayName || 'User'}! 👋
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} • {currentTime.toLocaleTimeString()}
          </p>
        </div>

        {/* Quick Stats */}
        {!isNewUser && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Work Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatHM(Math.floor(todayWorkSeconds / 60))}</div>
              <p className="text-xs text-muted-foreground">
                {Math.min(100, Math.round(((todayWorkSeconds / 60) / (dailyGoal * 60)) * 100))}% of daily goal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Break Time</CardTitle>
              <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatHMS(Math.floor(breakTodaySeconds))}</div>
              <p className="text-xs text-muted-foreground">
                {sessionsCompleted} sessions completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productivity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productivityScore}%</div>
              <Badge className={getProductivityStatus().bg + " " + getProductivityStatus().color}>
                {getProductivityStatus().text}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wellnessScore}%</div>
              <Badge className={getWellnessStatus().bg + " " + getWellnessStatus().color}>
                {getWellnessStatus().text}
              </Badge>
            </CardContent>
          </Card>
        </div>
        )}

        {isNewUser && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Welcome! Start your journey</CardTitle>
              <CardDescription>
                No activity yet. Start your first work session to see stats and recent activity here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => window.location.href = '#schedule'}>Start a Work Session</Button>
                <Button variant="outline" onClick={() => window.location.href = '/food-suggestions'}>Try Food Suggestions</Button>
                <Button variant="outline" onClick={() => window.location.href = '/eye-care'}>View Eye Care</Button>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Main Tabs */}
        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="schedule">Work Session Timer</TabsTrigger>
            <TabsTrigger value="ai-chat">AI Chatbot</TabsTrigger>
            <TabsTrigger value="eye-care">Eye Care</TabsTrigger>
            <TabsTrigger value="food-suggestions">Food Suggestions</TabsTrigger>
            <TabsTrigger value="exercises">Mental Health Exercises</TabsTrigger>
            <TabsTrigger value="wellness">Wellness Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <WorkSessionTimer />
          </TabsContent>

          <TabsContent value="ai-chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Emotional Support Chatbot
                </CardTitle>
                <CardDescription>
                  Share your thoughts and get personalized wellness suggestions based on your emotions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground mb-4">
                    Get emotional support and wellness recommendations from our AI assistant.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/chatbot'}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Open AI Chatbot
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eye-care" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Eye Care & Digital Wellness
                </CardTitle>
                <CardDescription>
                  Protect your eyes from digital strain with personalized tips and reminders.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Eye className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground mb-4">
                    Get eye care tips, follow the 20-20-20 rule, and maintain healthy digital habits.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/eye-care'}
                    className="bg-primary hover:bg-primary/90"
                  >
                    View Eye Care Tips
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="food-suggestions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Weather-Based Food Suggestions
                </CardTitle>
                <CardDescription>
                  Get personalized healthy food recommendations based on your local weather conditions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Utensils className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground mb-4">
                    Discover healthy food options that match your weather and boost your wellness.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/food-suggestions'}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Get Food Suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Mental Health Exercises & Meditation
                </CardTitle>
                <CardDescription>
                  Improve your mental well-being with guided exercises, meditation sessions, and mindfulness practices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Dumbbell className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground mb-4">
                    Access a variety of mental health exercises, breathing techniques, and guided meditation sessions.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/exercises'}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Start Mental Health Exercises
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wellness" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Wellness Overview
                </CardTitle>
                <CardDescription>
                  Your comprehensive wellness dashboard with all available features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Brain className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">AI Chatbot</h3>
                    <p className="text-sm text-muted-foreground">Emotional support & wellness advice</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">Eye Care</h3>
                    <p className="text-sm text-muted-foreground">Digital wellness & eye protection</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Utensils className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">Food Suggestions</h3>
                    <p className="text-sm text-muted-foreground">Weather-based nutrition advice</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Dumbbell className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">Mental Health Exercises</h3>
                    <p className="text-sm text-muted-foreground">Meditation & mindfulness practices</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        {!isNewUser && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest wellness activities and sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              // Primary: timer-based segments (work/break)
              const now = Date.now();
              const minuteMs = 60000;
              const buildBucket = (offsetMin: number) => {
                const start = now - (offsetMin + 1) * minuteMs;
                const end = now - offsetMin * minuteMs;
                const inRange = (t: number) => t > start && t <= end;
                const moves = activityData.mouseMoves.filter(m => inRange(m.timestamp)).length;
                const clicks = activityData.clicks.filter(c => inRange(c.timestamp)).length;
                const scrolls = activityData.scrolls.filter(s => inRange(s.timestamp)).length;
                const events = moves + clicks + scrolls;
                const recentVisibility = activityData.visibility.filter(v => inRange(v.timestamp));
                const visible = recentVisibility.length ? recentVisibility[recentVisibility.length - 1].visible : (!document.hidden);
                const focused = recentVisibility.length ? recentVisibility[recentVisibility.length - 1].focused : document.hasFocus();
                const isIdle = activityData.isIdle && end > activityData.lastActivity + 30000;
                const activityType: 'work' | 'break' | 'wellness' | 'idle' | 'away' | 'visibility' = (isActive && phase === 'break') ? 'break' : (visible && focused && events > 0 ? 'work' : 'idle');
                return {
                  activityType,
                  timestamp: end,
                  duration: 1,
                  details: { mouseMovements: moves, clicks, scrolls, events }
                } as any;
              };
              const derived = [0,1,2,3,4].map(buildBucket).filter(a => a.details.events > 0);

              const segments = recentTimerSegments.slice(0, 5).map((seg) => ({
                activityType: seg.kind,
                timestamp: seg.endMs ?? now,
                duration: Math.max(1, Math.round(((seg.endMs ?? now) - seg.startMs) / 60000)),
              }));

              const fromDb = (activities && activities.length > 0 ? activities.slice(0,5) : []);
              const recent = segments.length > 0 ? segments : (fromDb.length > 0 ? fromDb : derived);
              return recent.length > 0 ? (
              <div className="space-y-3">
                {recent.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={activity.activityType === 'work' ? 'default' : 'secondary'}>
                        {activity.activityType}
                      </Badge>
                      <span className="text-sm">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {activity.duration} min
                    </span>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No activity recorded yet. Start your first session!</p>
                </div>
              );
            })()}
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}

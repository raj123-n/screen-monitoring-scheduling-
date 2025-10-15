import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Monitor, MousePointer, Brain, Clock, Activity, TrendingUp } from "lucide-react";
import screentimeDashboard from "@/assets/screentime-dashboard.jpg";
import aiTrackingIcon from "@/assets/ai-tracking-icon.jpg";
import mouseTrackingIcon from "@/assets/mouse-tracking-icon.jpg";
import { useScreenTime } from "@/contexts/ScreenTimeContext";
import { useDatabase } from "@/hooks/useDatabase";
import { useTimer } from "@/contexts/TimerContext";
import { useActivityTracker } from "@/hooks/useActivityTracker";

const trackingFeatures = [
  {
    icon: Monitor,
    title: "Screen Time Analytics",
    description: "Real-time tracking of your digital consumption patterns",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20"
  },
  {
    icon: MousePointer,
    title: "Mouse Activity Tracking",
    description: "Advanced cursor movement and interaction analysis",
    color: "text-teal-500",
    bgColor: "bg-teal-50 dark:bg-teal-950/20"
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Smart suggestions for healthier digital habits",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20"
  }
];

function formatHM(totalMinutes: number) {
  const hrs = Math.floor(totalMinutes / 60);
  const mins = Math.floor(totalMinutes % 60);
  return `${hrs}h ${mins}m`;
}

export function ScreenTimeTracker() {
  const { todayActiveSeconds } = useScreenTime();
  const { activities } = useDatabase();
  const { breakDurationSeconds, isActive, phase, timeLeftSeconds } = useTimer();
  const { getActivityStats } = useActivityTracker();

  // Weekly average screen time (work minutes) over the last 7 days
  const weeklyAvgMinutes = useMemo(() => {
    if (!activities || activities.length === 0) {
      return Math.floor((todayActiveSeconds || 0) / 60);
    }
    const now = Date.now();
    const start = now - 7 * 24 * 60 * 60 * 1000;
    const byDay: Record<string, number> = {};
    for (const a of activities) {
      if (!a.timestamp || a.timestamp < start) continue;
      const d = new Date(a.timestamp);
      d.setHours(0, 0, 0, 0);
      const key = String(d.getTime());
      const minutes = a.duration || 0;
      if (a.activityType === 'work') {
        byDay[key] = (byDay[key] || 0) + minutes;
      }
    }
    const days = Object.keys(byDay).length || 1;
    const total = Object.values(byDay).reduce((s, v) => s + v, 0);
    return Math.floor(total / days);
  }, [activities, todayActiveSeconds]);

  // Track today's cumulative break seconds and compute breaks taken
  const BREAK_STORAGE_KEY = 'breeze-break-time-today-v1';
  const [breakDayMs, setBreakDayMs] = useState<number>(() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); });
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

  const breaksTakenCount = useMemo(() => {
    if (!breakDurationSeconds) return 0;
    const currentBreakElapsed = isActive && phase === 'break' ? Math.max(0, breakDurationSeconds - timeLeftSeconds) : 0;
    const cumulative = breakTodaySeconds + currentBreakElapsed;
    return Math.floor(cumulative / Math.max(1, breakDurationSeconds));
  }, [breakTodaySeconds, breakDurationSeconds, isActive, phase, timeLeftSeconds]);

  // Live focus score from activity stats
  const [focusScore, setFocusScore] = useState<number>(78);
  useEffect(() => {
    const interval = setInterval(() => {
      const s = getActivityStats();
      const activityRate = Math.min(120, s.eventsLastMinute);
      const base = Math.floor((activityRate / 120) * 95);
      const idlePenalty = s.isCurrentlyIdle ? 25 : 0;
      const velocityPenalty = Math.min(20, Math.floor((s.averageVelocity || 0) * 60));
      const score = Math.max(0, Math.min(100, base - idlePenalty - velocityPenalty));
      setFocusScore(score);
    }, 1000);
    return () => clearInterval(interval);
  }, [getActivityStats]);

  const todayScreenTime = formatHM(Math.floor((todayActiveSeconds || 0) / 60));
  const weeklyAverage = formatHM(weeklyAvgMinutes);
  const suggestedBreaks = Math.max(0, Math.floor((todayActiveSeconds || 0) / (90 * 60))); // 90-min rule

  return (
    <section className="py-20 bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="secondary" className="mb-6 text-sm font-medium">
            🤖 AI-Powered Wellness
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Transform Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Digital Habits
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our advanced AI analyzes your screen time and mouse activity to provide personalized insights 
            and break suggestions for better mental and physical wellbeing.
          </p>
        </div>

        {/* Main Dashboard Preview */}
        <div className="mb-20 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <Card className="glass border-0 overflow-hidden hover-lift">
            <div className="relative">
              <img 
                src={screentimeDashboard} 
                alt="Screentime Analytics Dashboard" 
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card className="bg-background/90 backdrop-blur-sm border-0">
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{todayScreenTime}</p>
                      <p className="text-xs text-muted-foreground">Today</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/90 backdrop-blur-sm border-0">
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{weeklyAverage}</p>
                      <p className="text-xs text-muted-foreground">Weekly Avg</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/90 backdrop-blur-sm border-0">
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-success">{breaksTakenCount}</p>
                      <p className="text-xs text-muted-foreground">Breaks Taken</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/90 backdrop-blur-sm border-0">
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-warning">{suggestedBreaks}</p>
                      <p className="text-xs text-muted-foreground">Suggested</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/90 backdrop-blur-sm border-0">
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-teal-500">{focusScore}</p>
                      <p className="text-xs text-muted-foreground">Focus Score</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {trackingFeatures.map((feature, index) => (
            <Card 
              key={feature.title}
              className="group hover-lift glass border-0 animate-fade-in-up"
              style={{ animationDelay: `${400 + index * 100}ms` }}
            >
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto p-4 rounded-2xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-all`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* AI Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="glass border-0 hover-lift animate-fade-in-up" style={{ animationDelay: "700ms" }}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <img src={aiTrackingIcon} alt="AI Tracking" className="w-12 h-12 rounded-lg" />
                <div>
                  <CardTitle className="text-xl">Smart Break Suggestions</CardTitle>
                  <CardDescription>AI-powered recommendations based on your patterns</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">🧠 Suggested Break</p>
                <p className="text-sm text-muted-foreground">
                  You've been focused for 90 minutes. Take a 5-minute walk to boost creativity and reduce eye strain.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Break Effectiveness</span>
                <span className="text-sm text-success">+23% productivity</span>
              </div>
              <Progress value={85} className="h-2" />
            </CardContent>
          </Card>

          <Card className="glass border-0 hover-lift animate-fade-in-up" style={{ animationDelay: "800ms" }}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <img src={mouseTrackingIcon} alt="Mouse Tracking" className="w-12 h-12 rounded-lg" />
                <div>
                  <CardTitle className="text-xl">Activity Analysis</CardTitle>
                  <CardDescription>Real-time monitoring of your digital interactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mouse Movement</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <Progress value={92} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Click Frequency</span>
                  <Badge variant="outline">Normal</Badge>
                </div>
                <Progress value={68} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sedentary Time</span>
                  <Badge variant="destructive">High</Badge>
                </div>
                <Progress value={78} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fade-in" style={{ animationDelay: "900ms" }}>
          <Card className="glass border-0 p-8 max-w-2xl mx-auto">
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Activity className="h-6 w-6 text-primary" />
                <TrendingUp className="h-6 w-6 text-success" />
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold">
                Ready to Improve Your Digital Wellbeing?
              </h3>
              <p className="text-muted-foreground">
                Start tracking your screen time and activity patterns today. Our AI will help you build healthier habits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/digital-habits">
                  <Button variant="hero" size="lg" className="text-lg">
                    Start Tracking Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
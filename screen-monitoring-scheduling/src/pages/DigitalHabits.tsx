import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Monitor, 
  MousePointer, 
  Brain, 
  Clock, 
  Activity, 
  TrendingUp, 
  Eye, 
  Coffee, 
  Lightbulb,
  BarChart3,
  Shield,
  Zap,
  Timer,
  AlertTriangle,
  CheckCircle,
  Target,
  Play,
  Pause,
  RotateCcw,
  Droplets
} from "lucide-react";
import digitalHabitsHero from "@/assets/digital-habits-hero.jpg";
import screentimeDashboard from "@/assets/screentime-dashboard.jpg";
import aiTrackingIcon from "@/assets/ai-tracking-icon.jpg";
import mouseTrackingIcon from "@/assets/mouse-tracking-icon.jpg";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { WorkSessionTimer } from "@/components/WorkSessionTimer";
import { useDatabase } from "@/hooks/useDatabase";
import { useScreenTime } from "@/contexts/ScreenTimeContext";
import { useTimer } from "@/contexts/TimerContext";

const features = [
  {
    icon: Monitor,
    title: "Advanced Screen Time Analytics",
    description: "Track your digital consumption with precision timing and detailed app-level insights",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20"
  },
  {
    icon: MousePointer,
    title: "Mouse Activity Intelligence",
    description: "Analyze cursor patterns, click frequency, and interaction behaviors for health insights",
    color: "text-teal-500",
    bgColor: "bg-teal-50 dark:bg-teal-950/20"
  },
  {
    icon: Brain,
    title: "AI-Powered Break Suggestions",
    description: "Personalized recommendations based on your unique work patterns and stress indicators",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20"
  },
  {
    icon: Eye,
    title: "Eye Strain Prevention",
    description: "Smart reminders for the 20-20-20 rule and blue light exposure management",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/20"
  },
  {
    icon: Coffee,
    title: "Micro-Break Optimization",
    description: "Science-backed break intervals to maintain focus and prevent burnout",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20"
  },
  {
    icon: Lightbulb,
    title: "Productivity Insights",
    description: "Discover your peak performance hours and optimize your workflow accordingly",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20"
  }
];

const stats = [
  { label: "Average Screen Time Reduction", value: "2.5 hours", color: "text-success" },
  { label: "Productivity Increase", value: "+34%", color: "text-primary" },
  { label: "Eye Strain Reports Decreased", value: "78%", color: "text-teal-500" },
  { label: "Break Compliance Rate", value: "89%", color: "text-purple-500" }
];

function formatHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

export default function DigitalHabits() {
  const { getActivityStats, activityData } = useActivityTracker();
  const navigate = useNavigate();
  const { activities } = useDatabase();
  const [currentTab, setCurrentTab] = useState("mouse-activity");
  const [focusScore, setFocusScore] = useState(80);
  const [eyeStrainRisk, setEyeStrainRisk] = useState(20);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const { todayActiveSeconds: globalActiveSeconds } = useScreenTime();
  const lastTickActiveRef = useRef<boolean>(false);
  const toolsRef = useRef<HTMLDivElement | null>(null);
  const { phase, isActive, timeLeftSeconds, workDurationSeconds, breakDurationSeconds } = useTimer();

  const goToTools = (tab: string) => {
    setCurrentTab(tab);
    setTimeout(() => {
      toolsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const activityStats = getActivityStats();
  const movementPct = useMemo(() => Math.min(100, Math.round((activityStats.mouseMovesLastMinute / 150) * 100)), [activityStats.mouseMovesLastMinute]);
  const clicksPct = useMemo(() => Math.min(100, Math.round((activityStats.clicksLastMinute / 120) * 100)), [activityStats.clicksLastMinute]);
  const sedentaryPct = useMemo(() => {
    const events = Math.min(120, activityStats.eventsLastMinute);
    return 100 - Math.round((events / 120) * 100);
  }, [activityStats.eventsLastMinute]);

  // Compute today's accumulated active (work) time from persisted activities (real-time subscription)
  const todayBaseSeconds = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startMs = startOfDay.getTime();
    let totalMinutes = 0;
    for (const a of activities) {
      if (a.timestamp >= startMs && a.activityType === 'work') {
        totalMinutes += a.duration || 0;
      }
    }
    return totalMinutes * 60;
  }, [activities]);

  // Per-second live increment while currently active to feel real-time between minute heartbeats
  useEffect(() => {
    const tick = () => {
      const stats = getActivityStats();
      const isVisible = !document.hidden && document.hasFocus();
      const isActive = isVisible && !activityData.isIdle && stats.eventsLastMinute > 0;
      // reset live seconds when not active to avoid drifting
      if (!isActive) {
        if (lastTickActiveRef.current) setLiveSeconds(0);
        lastTickActiveRef.current = false;
        return;
      }
      lastTickActiveRef.current = true;
      setLiveSeconds((s) => (s + 1) % 60);
    };
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [getActivityStats, activityData.isIdle]);

  // Derive focus score and eye strain every second from current stats and accumulated time
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = getActivityStats();
      const velocity = stats.averageVelocity || 0;
      const eventRate = Math.min(120, stats.eventsLastMinute);
      const baseFocus = 100 - Math.min(60, Math.floor(velocity * 100));
      const activityBoost = Math.floor((eventRate / 120) * 30);
      const computedFocus = Math.max(0, Math.min(100, baseFocus + activityBoost));
      setFocusScore(computedFocus);

      const activeSecondsRecent = todayBaseSeconds + liveSeconds;
      const strainBase = Math.floor((eventRate / 120) * 60);
      const longSessionBonus = Math.min(40, Math.floor(activeSecondsRecent / 600));
      const computedStrain = Math.max(0, Math.min(100, strainBase + longSessionBonus));
      setEyeStrainRisk(computedStrain);
    }, 1000);
    return () => clearInterval(interval);
  }, [getActivityStats, todayBaseSeconds, liveSeconds]);

  // Use global tracker seconds if larger to avoid undercount when navigating between pages
  const todayActiveSeconds = Math.max(todayBaseSeconds + liveSeconds, globalActiveSeconds);
  const todayScreenTimeLabel = useMemo(() => formatHMS(todayActiveSeconds), [todayActiveSeconds]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="secondary" className="mb-6 text-sm font-medium">
              🎯 Digital Wellness Revolution
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              Master Your{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Digital Habits
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
              Transform your relationship with technology through AI-powered insights, 
              intelligent break suggestions, and comprehensive wellness tracking designed 
              for the modern digital professional.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <img 
              src={digitalHabitsHero} 
              alt="Digital wellness and healthy screen time habits" 
              className="w-full rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card 
                key={stat.label}
                className="text-center glass border-0 hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className={`text-3xl font-bold mb-2 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Comprehensive{" "}
              <span className="bg-gradient-secondary bg-clip-text text-transparent">
                Wellness Features
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Every feature is designed with your wellbeing in mind, powered by cutting-edge AI 
              and backed by scientific research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const onClick = () => {
                if (feature.title.includes('Screen Time')) return goToTools('screen-time');
                if (feature.title.includes('Mouse Activity')) return goToTools('mouse-activity');
                if (feature.title.includes('AI-Powered Break') || feature.title.includes('Micro-Break')) return goToTools('break-manager');
                if (feature.title.includes('Eye Strain')) return navigate('/eye-care');
                if (feature.title.includes('Productivity Insights')) return navigate('/dashboard');
                return goToTools('mouse-activity');
              };
              return (
                <Card 
                  key={feature.title}
                  className="group hover-lift glass border-0 animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={onClick}
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
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Dashboard Preview */}
      <section className="py-20 bg-muted/30" ref={toolsRef}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Interactive{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Wellness Tools
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Experience our powerful wellness tools in action. Monitor your activity, track screen time, 
              and manage breaks with intelligent recommendations.
            </p>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="mouse-activity" className="flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                Mouse Activity
              </TabsTrigger>
              <TabsTrigger value="screen-time" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Screen Time
              </TabsTrigger>
              <TabsTrigger value="break-manager" className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Break Manager
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mouse-activity" className="space-y-6">
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MousePointer className="h-5 w-5 text-primary" />
                    Real-Time Mouse Activity Tracking
                  </CardTitle>
                  <CardDescription>
                    Monitor your cursor movements, clicks, and interaction patterns for better wellness insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-2">Mouse Movements</div>
                      <div className="text-4xl font-bold text-primary">{activityStats.mouseMovesLastMinute}</div>
                      <p className="text-sm text-muted-foreground">Last minute</p>
                    </div>
                    <div className="text-center p-4 bg-success/10 rounded-lg">
                      <div className="text-2xl font-bold text-success mb-2">Clicks</div>
                      <div className="text-4xl font-bold text-success">{activityStats.clicksLastMinute}</div>
                      <p className="text-sm text-muted-foreground">Last minute</p>
                    </div>
                    <div className="text-center p-4 bg-warning/10 rounded-lg">
                      <div className="text-2xl font-bold text-warning mb-2">Scrolls</div>
                      <div className="text-4xl font-bold text-warning">{activityStats.scrollsLastMinute}</div>
                      <p className="text-sm text-muted-foreground">Last minute</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">Activity Insights</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Movement Intensity</span>
                        <Badge variant={movementPct > 66 ? "success" : movementPct > 33 ? "secondary" : "outline"}>
                          {movementPct > 66 ? "High" : movementPct > 33 ? "Moderate" : "Low"}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Click Frequency</span>
                        <Badge variant={clicksPct > 66 ? "success" : clicksPct > 33 ? "secondary" : "outline"}>
                          {clicksPct > 66 ? "High" : clicksPct > 33 ? "Moderate" : "Low"}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Events</span>
                        <Badge variant="outline">{activityStats.eventsLastMinute}/min</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Work Session Timer */}
              <WorkSessionTimer />
            </TabsContent>

            <TabsContent value="screen-time" className="space-y-6">
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    Screen Time Analytics Dashboard
                  </CardTitle>
                  <CardDescription>
                    Comprehensive tracking of your digital device usage with productivity insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <Card className="border-0 bg-primary/5">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Active Screen Time</CardTitle>
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-primary">{todayScreenTimeLabel}</div>
                        <p className="text-xs text-muted-foreground">Tracking live while you are active on this tab</p>
                        <Progress value={Math.min(100, Math.floor((todayActiveSeconds / (8 * 3600)) * 100))} className="mt-3" />
                      </CardContent>
                    </Card>

                    <Card className="border-0 bg-success/5">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Focus Score</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-success">{focusScore}/100</div>
                        <p className="text-xs text-muted-foreground">Real-time estimate based on activity</p>
                        <Progress value={focusScore} className="mt-3" />
                      </CardContent>
                    </Card>

                    <Card className="border-0 bg-warning/5">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Eye Strain Risk</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-warning">{eyeStrainRisk}%</div>
                        <p className="text-xs text-muted-foreground">Estimated from recent activity</p>
                        <Progress value={eyeStrainRisk} className="mt-3" />
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-0">
                    <CardHeader>
                      <CardTitle>Weekly Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img 
                        src={screentimeDashboard} 
                        alt="Weekly screen time and productivity trends" 
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </CardContent>
                  </Card>
                  
                  {/* Real-time Activity Monitor */}
                  <Card className="border-0 mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Real-Time Activity Monitor
                      </CardTitle>
                      <CardDescription>
                        Current session activity and productivity metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-semibold text-primary">{activityStats.eventsLastMinute}</div>
                          <p className="text-xs text-muted-foreground">Events/min</p>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-semibold text-success">{activityStats.mouseMovesLastMinute}</div>
                          <p className="text-xs text-muted-foreground">Mouse moves</p>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-semibold text-warning">{activityStats.clicksLastMinute}</div>
                          <p className="text-xs text-muted-foreground">Clicks</p>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-semibold text-blue-500">{activityStats.scrollsLastMinute}</div>
                          <p className="text-xs text-muted-foreground">Scrolls</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="break-manager" className="space-y-6">
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-primary" />
                    Intelligent Break Management
                  </CardTitle>
                  <CardDescription>
                    AI-powered break suggestions and wellness reminders to optimize your productivity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Break Schedule</h4>
                      <div className="space-y-3">
                        {isActive && phase === 'break' ? (
                          <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success" />
                              <span className="text-sm">Current Break</span>
                            </div>
                            <span className="text-sm text-muted-foreground">Ends in {Math.max(0, Math.floor(timeLeftSeconds / 60))}m {timeLeftSeconds % 60}s</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="text-sm">Next Break</span>
                            </div>
                            <span className="text-sm text-muted-foreground">Due in {isActive && phase === 'work' ? `${Math.max(0, Math.floor(timeLeftSeconds / 60))}m ${timeLeftSeconds % 60}s` : `${Math.floor(workDurationSeconds/60)}m`}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Configured Break</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{Math.floor(breakDurationSeconds/60)} minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Break Effectiveness</h4>
                      <div className="space-y-3">
                        {(() => {
                          const events = Math.min(120, activityStats.eventsLastMinute);
                          const productivityBoost = Math.min(100, Math.round((events / 120) * 100));
                          const stressReduction = Math.max(0, 100 - sedentaryPct);
                          const focusImprovement = Math.min(100, Math.round((movementPct * 0.4) + (clicksPct * 0.3) + (productivityBoost * 0.3)));
                          return (
                            <>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Productivity Boost</span>
                                  <span className="text-success">+{productivityBoost}%</span>
                                </div>
                                <Progress value={productivityBoost} />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Stress Reduction</span>
                                  <span className="text-success">+{stressReduction}%</span>
                                </div>
                                <Progress value={stressReduction} />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Focus Improvement</span>
                                  <span className="text-success">+{focusImprovement}%</span>
                                </div>
                                <Progress value={focusImprovement} />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm mb-1">Smart Break Recommendation</p>
                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            if (isActive && phase === 'work') {
                              const mins = Math.max(0, Math.floor(timeLeftSeconds / 60));
                              if (mins <= 10) return `You've been focused for a while. Take a 5-minute break in ${mins} minute(s) to sustain performance.`;
                              return `Next short break is due in ${mins} minute(s). Keep a steady pace and remember the 20-20-20 rule.`;
                            }
                            if (isActive && phase === 'break') {
                              const mins = Math.max(0, Math.floor(timeLeftSeconds / 60));
                              return `You're on a break. Try light stretching and resume work in ${mins} minute(s).`;
                            }
                            return `Timer is idle. Start a work session to receive personalized break guidance.`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Digital Life?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of professionals who have already improved their digital wellness 
              and productivity with Breeze's intelligent monitoring system.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
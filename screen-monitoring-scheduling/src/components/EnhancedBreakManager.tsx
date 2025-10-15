import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  Timer, 
  Bell, 
  Coffee, 
  Apple, 
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Play,
  Pause,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Heart,
  Target,
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  Brain,
  Activity,
  Eye
} from "lucide-react";

interface BreakSchedule {
  id: string;
  name: string;
  time: string;
  duration: number;
  type: 'eye-rest' | 'movement' | 'mental' | 'hydration' | 'stretch';
  enabled: boolean;
  completed: boolean;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  description: string;
}

interface BreakSession {
  id: string;
  type: string;
  startTime: number;
  endTime?: number;
  duration: number;
  effectiveness?: number;
  completed: boolean;
  notes?: string;
}

export default function EnhancedBreakManager() {
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [currentBreak, setCurrentBreak] = useState<BreakSession | null>(null);
  const [breakTimer, setBreakTimer] = useState(0);
  const [autoBreaks, setAutoBreaks] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [breakDuration, setBreakDuration] = useState([10]);
  const [breakInterval, setBreakInterval] = useState([60]);
  const [workStartTime, setWorkStartTime] = useState("09:00");
  const [workEndTime, setWorkEndTime] = useState("17:00");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [lastBreakTime, setLastBreakTime] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationRef = useRef<NodeJS.Timeout | null>(null);

  // Mock weather data - in real app, this would come from a weather API
  useEffect(() => {
    const mockWeatherData: WeatherData = {
      temperature: 22,
      condition: 'partly-cloudy',
      humidity: 65,
      description: 'Partly cloudy with mild temperature'
    };
    setWeatherData(mockWeatherData);
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto break scheduling
  useEffect(() => {
    if (!autoBreaks || isBreakActive) return;

    const now = new Date();
    const workStart = new Date();
    const [startHour, startMin] = workStartTime.split(':').map(Number);
    workStart.setHours(startHour, startMin, 0, 0);

    const workEnd = new Date();
    const [endHour, endMin] = workEndTime.split(':').map(Number);
    workEnd.setHours(endHour, endMin, 0, 0);

    // Check if we're within work hours
    if (now < workStart || now > workEnd) return;

    // Check if it's time for a break
    if (lastBreakTime) {
      const timeSinceLastBreak = now.getTime() - lastBreakTime.getTime();
      const breakIntervalMs = breakInterval[0] * 60 * 1000;
      
      if (timeSinceLastBreak >= breakIntervalMs) {
        suggestBreak();
      }
    } else {
      // First break of the day
      const timeSinceWorkStart = now.getTime() - workStart.getTime();
      const breakIntervalMs = breakInterval[0] * 60 * 1000;
      
      if (timeSinceWorkStart >= breakIntervalMs) {
        suggestBreak();
      }
    }
  }, [autoBreaks, isBreakActive, lastBreakTime, breakInterval, workStartTime, workEndTime]);

  // Break timer effect
  useEffect(() => {
    if (isBreakActive && currentBreak) {
      intervalRef.current = setInterval(() => {
        setBreakTimer(prev => {
          const newTime = prev + 1;
          if (newTime >= currentBreak.duration * 60) {
            completeBreak();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isBreakActive, currentBreak]);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-4 w-4 text-blue-500" />;
      case 'windy': return <Wind className="h-4 w-4 text-gray-400" />;
      default: return <Sun className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getWeatherBasedFoodSuggestions = (weather: WeatherData) => {
    const suggestions = [];
    
    if (weather.temperature > 25) {
      suggestions.push(
        "🍉 Watermelon - Perfect for staying hydrated in warm weather",
        "🥤 Coconut water - Natural electrolyte replenishment",
        "🥗 Light salad - Easy to digest in heat",
        "🍦 Greek yogurt with berries - Cooling and nutritious"
      );
    } else if (weather.temperature < 15) {
      suggestions.push(
        "☕ Hot herbal tea - Warming and comforting",
        "🥣 Warm soup - Nourishing and warming",
        "🌰 Mixed nuts - Energy-dense for cold weather",
        "🍎 Baked apple - Warm and nutritious"
      );
    } else {
      suggestions.push(
        "🍎 Fresh apple - Perfect for moderate temperatures",
        "🥜 Almonds - Great energy boost",
        "🥛 Smoothie - Balanced nutrition",
        "🥕 Carrot sticks - Crunchy and healthy"
      );
    }

    if (weather.humidity > 70) {
      suggestions.push("💧 Extra water - High humidity increases hydration needs");
    }

    return suggestions;
  };

  const suggestBreak = () => {
    if (!notifications) return;

    const breakTypes = [
      { type: 'eye-rest', name: 'Eye Rest Break', icon: Eye, color: 'text-blue-500' },
      { type: 'movement', name: 'Movement Break', icon: Activity, color: 'text-green-500' },
      { type: 'mental', name: 'Mental Break', icon: Brain, color: 'text-purple-500' },
      { type: 'hydration', name: 'Hydration Break', icon: Droplets, color: 'text-orange-500' },
      { type: 'stretch', name: 'Stretch Break', icon: Heart, color: 'text-pink-500' }
    ];

    const randomBreak = breakTypes[Math.floor(Math.random() * breakTypes.length)];
    const foodSuggestions = weatherData ? getWeatherBasedFoodSuggestions(weatherData).slice(0, 2) : [];

    setNotificationMessage(`Time for a ${randomBreak.name}! 

${foodSuggestions.length > 0 ? `🍎 **Food Suggestions (${weatherData?.temperature}°C):**
${foodSuggestions.map(s => `• ${s}`).join('\n')}

` : ''}💧 **Remember to:**
• Drink water
• Take deep breaths
• Move around
• Rest your eyes

Click to start your break now!`);
    
    setShowNotification(true);

    // Auto-hide notification after 30 seconds
    notificationRef.current = setTimeout(() => {
      setShowNotification(false);
    }, 30000);
  };

  const startBreak = (type: string = 'general') => {
    const newBreak: BreakSession = {
      id: Date.now().toString(),
      type,
      startTime: Date.now(),
      duration: breakDuration[0],
      completed: false
    };
    
    setCurrentBreak(newBreak);
    setIsBreakActive(true);
    setBreakTimer(0);
    setShowNotification(false);
    
    if (notificationRef.current) {
      clearTimeout(notificationRef.current);
    }
  };

  const completeBreak = () => {
    if (currentBreak) {
      const completedBreak: BreakSession = {
        ...currentBreak,
        endTime: Date.now(),
        completed: true,
        effectiveness: Math.floor(Math.random() * 30) + 70
      };
      
      setCurrentBreak(null);
      setIsBreakActive(false);
      setBreakTimer(0);
      setLastBreakTime(new Date());

      // Show completion notification
      setNotificationMessage(`Great job! Break completed. 

💡 **Break Summary:**
• Duration: ${currentBreak.duration} minutes
• Type: ${currentBreak.type}
• Effectiveness: ${completedBreak.effectiveness}%

${weatherData ? `🍎 **Weather-based suggestions (${weatherData.temperature}°C):**
${getWeatherBasedFoodSuggestions(weatherData).slice(0, 3).map(s => `• ${s}`).join('\n')}` : ''}

Keep up the great work! 🌟`);
      
      setShowNotification(true);
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 10000);
    }
  };

  const skipBreak = () => {
    setCurrentBreak(null);
    setIsBreakActive(false);
    setBreakTimer(0);
    setShowNotification(false);
    
    if (notificationRef.current) {
      clearTimeout(notificationRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeUntilNextBreak = () => {
    if (!lastBreakTime) return breakInterval[0];
    
    const now = new Date();
    const timeSinceLastBreak = now.getTime() - lastBreakTime.getTime();
    const breakIntervalMs = breakInterval[0] * 60 * 1000;
    const remaining = breakIntervalMs - timeSinceLastBreak;
    
    return Math.max(0, Math.floor(remaining / (60 * 1000)));
  };

  const timeUntilNextBreak = getTimeUntilNextBreak();

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">Current Time</span>
              </div>
              <Badge variant="secondary">
                {currentTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-primary">
              {currentTime.toLocaleDateString([], { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-green-500" />
                <span className="font-medium">Next Break</span>
              </div>
              <Badge variant="secondary">
                {timeUntilNextBreak}m
              </Badge>
            </div>
            <Progress 
              value={((breakInterval[0] - timeUntilNextBreak) / breakInterval[0]) * 100} 
              className="mb-2"
            />
            <div className="text-sm text-muted-foreground">
              {timeUntilNextBreak > 0 
                ? `${timeUntilNextBreak} minutes until next break`
                : "Ready for a break!"
              }
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {weatherData && getWeatherIcon(weatherData.condition)}
                <span className="font-medium">Weather</span>
              </div>
              <Badge variant="secondary">
                {weatherData?.temperature}°C
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {weatherData?.description}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Humidity: {weatherData?.humidity}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Break Timer */}
      {isBreakActive && currentBreak && (
        <Card className="glass border-0 bg-gradient-to-r from-primary/10 to-purple-500/10">
          <CardContent className="p-8 text-center">
            <div className="text-6xl font-bold text-primary mb-4">
              {formatTime(breakTimer)}
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              {currentBreak.type.replace('-', ' ')} Break
            </p>
            <Progress 
              value={(breakTimer / (currentBreak.duration * 60)) * 100} 
              className="mb-6"
            />
            <div className="flex gap-4 justify-center">
              <Button onClick={completeBreak} variant="default">
                Complete Break
              </Button>
              <Button onClick={skipBreak} variant="outline">
                Skip Break
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Break Suggestions */}
      {!isBreakActive && (
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Break Suggestions
            </CardTitle>
            <CardDescription>
              Choose a break type or let AI suggest one based on your activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: 'eye-rest', name: 'Eye Rest', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                { type: 'movement', name: 'Movement', icon: Activity, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
                { type: 'mental', name: 'Mental', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
                { type: 'hydration', name: 'Hydration', icon: Droplets, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
                { type: 'stretch', name: 'Stretch', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/20' },
                { type: 'ai-suggested', name: 'AI Suggested', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20' }
              ].map((breakType) => (
                <Button
                  key={breakType.type}
                  variant="outline"
                  className={`h-20 flex flex-col items-center justify-center gap-2 ${breakType.bg} hover:${breakType.bg}`}
                  onClick={() => startBreak(breakType.type)}
                >
                  <breakType.icon className={`h-6 w-6 ${breakType.color}`} />
                  <span className="text-sm font-medium">{breakType.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Break Settings
          </CardTitle>
          <CardDescription>
            Customize your break schedule and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Auto Break Suggestions</Label>
                <Switch checked={autoBreaks} onCheckedChange={setAutoBreaks} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Break Notifications</Label>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Break Duration (minutes)</Label>
                <Slider
                  value={breakDuration}
                  onValueChange={setBreakDuration}
                  max={30}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">
                  {breakDuration[0]} minutes
                </span>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Break Interval (minutes)</Label>
                <Slider
                  value={breakInterval}
                  onValueChange={setBreakInterval}
                  max={120}
                  min={30}
                  step={15}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">
                  Every {breakInterval[0]} minutes
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Work Start Time</Label>
                <input
                  type="time"
                  value={workStartTime}
                  onChange={(e) => setWorkStartTime(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Work End Time</Label>
                <input
                  type="time"
                  value={workEndTime}
                  onChange={(e) => setWorkEndTime(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="pt-4">
                <Button 
                  onClick={suggestBreak}
                  variant="outline"
                  className="w-full"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Test Notification
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Card className="glass border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm mb-4">
                    {notificationMessage}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        if (notificationMessage.includes("Time for a")) {
                          startBreak();
                        }
                        setShowNotification(false);
                      }}
                    >
                      {notificationMessage.includes("Time for a") ? "Start Break" : "Got it"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowNotification(false)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

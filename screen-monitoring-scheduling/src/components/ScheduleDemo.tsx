import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MousePointer, 
  Activity, 
  Eye, 
  Clock, 
  TrendingUp, 
  Zap,
  Target,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Bell,
  Coffee,
  Apple,
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Timer,
  Settings,
  Brain,
  Heart,
  Utensils
} from "lucide-react";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  isRaining: boolean;
}

interface FoodSuggestion {
  name: string;
  type: 'snack' | 'meal' | 'drink';
  weather: string[];
  benefits: string[];
  icon: string;
}

interface ScheduleDemoProps {
  workDuration: number;
  breakDuration: number;
  onSessionComplete: (sessionData: {
    workDuration: number;
    breakDuration: number;
    weatherData?: WeatherData;
    foodSuggestions?: string[];
    activities?: string[];
  }) => void;
}

const foodSuggestions: FoodSuggestion[] = [
  {
    name: "Warm Tea",
    type: "drink",
    weather: ["cold", "rainy"],
    benefits: ["Hydrating", "Warming", "Calming"],
    icon: "☕"
  },
  {
    name: "Fresh Fruits",
    type: "snack",
    weather: ["hot", "sunny"],
    benefits: ["Hydrating", "Vitamins", "Natural energy"],
    icon: "🍎"
  },
  {
    name: "Nuts & Dry Fruits",
    type: "snack",
    weather: ["all"],
    benefits: ["Protein", "Healthy fats", "Sustained energy"],
    icon: "🥜"
  },
  {
    name: "Water",
    type: "drink",
    weather: ["all"],
    benefits: ["Hydration", "Detox", "Energy"],
    icon: "💧"
  },
  {
    name: "Green Smoothie",
    type: "drink",
    weather: ["hot", "sunny"],
    benefits: ["Nutrients", "Hydration", "Energy boost"],
    icon: "🥤"
  },
  {
    name: "Dark Chocolate",
    type: "snack",
    weather: ["cold", "rainy"],
    benefits: ["Mood boost", "Antioxidants", "Energy"],
    icon: "🍫"
  }
];

export function ScheduleDemo({ workDuration=2, breakDuration=1, onSessionComplete }: ScheduleDemoProps) {
  const { currentUser } = useAuth();
  const { getActivityStats } = useActivityTracker();
  const [isTracking, setIsTracking] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(workDuration * 60); // Convert to seconds
  const [workTimeElapsed, setWorkTimeElapsed] = useState(0);
  const [breakTimeElapsed, setBreakTimeElapsed] = useState(0);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [currentFoodSuggestions, setCurrentFoodSuggestions] = useState<FoodSuggestion[]>([]);
  const [currentActivities, setCurrentActivities] = useState<string[]>([]);
  
  const workTimerRef = useRef<NodeJS.Timeout | null>(null);
  const breakTimerRef = useRef<NodeJS.Timeout | null>(null);
  const weatherIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stats = getActivityStats();

  // Initialize with props
  useEffect(() => {
    setTimeRemaining(workDuration * 60);
  }, [workDuration]);

  // Fetch weather data every 30 minutes
  useEffect(() => {
    fetchWeatherData();
    
    weatherIntervalRef.current = setInterval(() => {
      fetchWeatherData();
    }, 30 * 60 * 1000); // 30 minutes

    return () => {
      if (weatherIntervalRef.current) {
        clearInterval(weatherIntervalRef.current);
      }
    };
  }, []);

  const fetchWeatherData = async () => {
    try {
      // Simulated weather API call
      const mockWeatherData: WeatherData = {
        temperature: Math.floor(Math.random() * 30) + 10, // 10-40°C
        condition: ['sunny', 'cloudy', 'rainy', 'cold'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        isRaining: Math.random() > 0.7
      };
      
      setWeatherData(mockWeatherData);
      
      // Update food suggestions based on weather
      const suggestions = foodSuggestions.filter(food => 
        food.weather.includes('all') || food.weather.includes(mockWeatherData.condition)
      );
      setCurrentFoodSuggestions(suggestions);
      
      // Set activities based on weather
      const activities = [];
      if (mockWeatherData.condition === 'sunny' && mockWeatherData.temperature > 20) {
        activities.push('Take a walk outside', 'Do some stretching in the sun');
      } else if (mockWeatherData.condition === 'rainy') {
        activities.push('Indoor stretching', 'Meditation session');
      } else if (mockWeatherData.condition === 'cold') {
        activities.push('Warm-up exercises', 'Hot beverage break');
      } else {
        activities.push('Quick stretch', 'Deep breathing');
      }
      setCurrentActivities(activities);
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'cold': return <Thermometer className="h-6 w-6 text-blue-400" />;
      default: return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  const startTrackingSession = () => {
    if (isTracking) return;
    
    setIsTracking(true);
    setIsBreak(false);
    setTimeRemaining(workDuration * 60);
    setWorkTimeElapsed(0);
    
    workTimerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Work session completed
          clearInterval(workTimerRef.current!);
          setIsTracking(false);
          setShowBreakDialog(true);
          return 0;
        }
        return prev - 1;
      });
      
      setWorkTimeElapsed(prev => prev + 1);
    }, 1000);
  };

  const startBreak = () => {
    setIsBreak(true);
    setTimeRemaining(breakDuration * 60);
    setBreakTimeElapsed(0);
    setShowBreakDialog(false);
    
    breakTimerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Break completed
          clearInterval(breakTimerRef.current!);
          setIsBreak(false);
          endBreak();
          return 0;
        }
        return prev - 1;
      });
      
      setBreakTimeElapsed(prev => prev + 1);
    }, 1000);
  };

  const endBreak = () => {
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
    }
    
    setIsBreak(false);
    
    // Call the callback with session data
    onSessionComplete({
      workDuration: workTimeElapsed / 60, // Convert seconds to minutes
      breakDuration: breakTimeElapsed / 60, // Convert seconds to minutes
      weatherData: weatherData || undefined,
      foodSuggestions: currentFoodSuggestions.map(food => food.name),
      activities: currentActivities
    });
    
    toast.success("Session completed! Great job staying focused!");
  };

  const pauseSession = () => {
    if (workTimerRef.current) {
      clearInterval(workTimerRef.current);
    }
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
    }
    setIsTracking(false);
    setIsBreak(false);
  };

  const resetSession = () => {
    if (workTimerRef.current) {
      clearInterval(workTimerRef.current);
    }
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
    }
    setIsTracking(false);
    setIsBreak(false);
    setTimeRemaining(workDuration * 60);
    setWorkTimeElapsed(0);
    setBreakTimeElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (isBreak) {
      return ((breakDuration * 60 - timeRemaining) / (breakDuration * 60)) * 100;
    }
    return ((workDuration * 60 - timeRemaining) / (workDuration * 60)) * 100;
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (workTimerRef.current) {
        clearInterval(workTimerRef.current);
      }
      if (breakTimerRef.current) {
        clearInterval(breakTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Weather and Food Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Thermometer className="h-5 w-5" />
            <span>Current Weather & Recommendations</span>
          </CardTitle>
          <CardDescription>
            Personalized suggestions based on real-time weather conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weatherData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weather Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {getWeatherIcon(weatherData.condition)}
                  <div>
                    <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
                    <p className="text-sm text-muted-foreground capitalize">{weatherData.condition}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Droplets className="h-4 w-4" />
                  <span>Humidity: {weatherData.humidity}%</span>
                </div>
              </div>
              
              {/* Food Suggestions */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center space-x-2">
                  <Apple className="h-4 w-4" />
                  <span>Recommended Snacks</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {currentFoodSuggestions.slice(0, 4).map((food, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-muted/50 rounded-lg">
                      <span className="text-lg">{food.icon}</span>
                      <span className="text-sm font-medium">{food.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Thermometer className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Loading weather data...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Timer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <span>{isBreak ? 'Break Timer' : 'Work Session Timer'}</span>
          </CardTitle>
          <CardDescription>
            {isBreak 
              ? `Take a ${breakDuration}-minute break to refresh and recharge`
              : `Focus on your work for ${workDuration} minutes`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-4">
              {formatTime(timeRemaining)}
            </div>
            <Progress value={getProgressPercentage()} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              {isBreak ? 'Break time remaining' : 'Work time remaining'}
            </p>
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Work Time</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatTime(workTimeElapsed)}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Break Time</p>
              <p className="text-2xl font-bold text-green-600">
                {formatTime(breakTimeElapsed)}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!isTracking && !isBreak ? (
              <Button onClick={startTrackingSession} size="lg" className="px-8">
                <Play className="h-5 w-5 mr-2" />
                Start Work Session
              </Button>
            ) : (
              <>
                <Button onClick={pauseSession} variant="outline" size="lg">
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
                <Button onClick={resetSession} variant="outline" size="lg">
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset
                </Button>
              </>
            )}
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Mouse Movements</p>
              <p className="text-lg font-semibold">{stats.mouseMovesLastMinute}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clicks</p>
              <p className="text-lg font-semibold">{stats.clicksLastMinute}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scrolls</p>
              <p className="text-lg font-semibold">{stats.scrollsLastMinute}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Break Notification Dialog */}
      <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Coffee className="h-5 w-5 text-orange-500" />
              <span>Time for a Break!</span>
            </DialogTitle>
            <DialogDescription>
              Great work! It's time to take a {breakDuration}-minute break to refresh your mind and body.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Weather-based Recommendations */}
            {weatherData && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Thermometer className="h-4 w-4" />
                  <span>Weather-based Suggestions</span>
                </h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Temperature:</strong> {weatherData.temperature}°C, {weatherData.condition}
                  </p>
                  {currentFoodSuggestions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Recommended:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentFoodSuggestions.slice(0, 3).map((food, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {food.icon} {food.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentActivities.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Activities:</p>
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                        {currentActivities.map((activity, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Heart className="h-3 w-3 text-red-500" />
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Break Actions */}
            <div className="space-y-3">
              <Button onClick={startBreak} className="w-full">
                <Coffee className="h-4 w-4 mr-2" />
                Start {breakDuration}-Minute Break
              </Button>
              <Button onClick={() => setShowBreakDialog(false)} variant="outline" className="w-full">
                Skip Break
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

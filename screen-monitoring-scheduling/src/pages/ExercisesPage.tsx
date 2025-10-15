"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Heart, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Lightbulb,
  Zap,
  Target,
  Timer,
  Users,
  BookOpen,
  Music,
  Wind
} from "lucide-react";

// Mental Health Exercises Data
const mentalHealthExercises = [
  {
    id: 1,
    title: "Deep Breathing Exercise",
    duration: "5 minutes",
    difficulty: "Beginner",
    category: "Breathing",
    description: "A simple breathing technique to reduce stress and anxiety.",
    steps: [
      "Find a comfortable seated position",
      "Close your eyes and relax your shoulders",
      "Breathe in slowly through your nose for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale slowly through your mouth for 6 counts",
      "Repeat this cycle for 5 minutes",
      "Focus on the rhythm of your breathing"
    ],
    benefits: ["Reduces stress", "Lowers blood pressure", "Improves focus", "Calms the mind"],
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 2,
    title: "Progressive Muscle Relaxation",
    duration: "15 minutes",
    difficulty: "Intermediate",
    category: "Relaxation",
    description: "Systematically tense and relax different muscle groups to release physical tension.",
    steps: [
      "Lie down or sit comfortably",
      "Start with your toes - tense them for 5 seconds, then relax",
      "Move to your calves - tense and relax",
      "Continue with thighs, abdomen, chest, arms, hands, neck, and face",
      "Focus on the contrast between tension and relaxation",
      "End with deep breathing for 2 minutes"
    ],
    benefits: ["Reduces muscle tension", "Improves sleep", "Decreases anxiety", "Enhances body awareness"],
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 3,
    title: "Mindful Body Scan",
    duration: "20 minutes",
    difficulty: "Intermediate",
    category: "Mindfulness",
    description: "A guided meditation to bring awareness to different parts of your body.",
    steps: [
      "Lie down comfortably with eyes closed",
      "Start by focusing on your breathing",
      "Bring attention to your toes and feet",
      "Slowly move your awareness up through your legs",
      "Continue through your torso, arms, and head",
      "Notice any sensations without judgment",
      "End by bringing awareness to your whole body"
    ],
    benefits: ["Increases body awareness", "Reduces stress", "Improves sleep", "Enhances mindfulness"],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 4,
    title: "Gratitude Journaling",
    duration: "10 minutes",
    difficulty: "Beginner",
    category: "Journaling",
    description: "Write down things you're grateful for to shift your mindset positively.",
    steps: [
      "Find a quiet space with a notebook",
      "Write down 3 things you're grateful for today",
      "Be specific about why you're grateful",
      "Reflect on how these things make you feel",
      "Consider writing about small moments of joy",
      "End with a positive affirmation about yourself"
    ],
    benefits: ["Improves mood", "Increases optimism", "Reduces depression", "Enhances well-being"],
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 5,
    title: "Loving-Kindness Meditation",
    duration: "15 minutes",
    difficulty: "Intermediate",
    category: "Meditation",
    description: "Cultivate compassion and love for yourself and others through guided meditation.",
    steps: [
      "Sit comfortably with eyes closed",
      "Start by sending love to yourself: 'May I be happy, may I be healthy'",
      "Think of someone you love and send them loving thoughts",
      "Think of a neutral person and wish them well",
      "Think of someone you have difficulty with and send them compassion",
      "Finally, send love to all beings everywhere",
      "End with gratitude for the practice"
    ],
    benefits: ["Increases compassion", "Reduces anger", "Improves relationships", "Enhances empathy"],
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 6,
    title: "Cognitive Reframing Exercise",
    duration: "10 minutes",
    difficulty: "Advanced",
    category: "Cognitive",
    description: "Challenge negative thoughts and replace them with more balanced perspectives.",
    steps: [
      "Identify a negative thought you're having",
      "Write it down exactly as it appears",
      "Ask yourself: 'Is this thought 100% true?'",
      "Consider alternative explanations or perspectives",
      "Write down a more balanced, realistic thought",
      "Reflect on how the new thought makes you feel",
      "Practice this regularly with different thoughts"
    ],
    benefits: ["Reduces negative thinking", "Improves mood", "Increases resilience", "Enhances problem-solving"],
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center"
  }
];

// Meditation Sessions Data
const meditationSessions = [
  {
    id: 1,
    title: "Morning Mindfulness",
    duration: "10 minutes",
    type: "Guided",
    description: "Start your day with intention and awareness.",
    instructions: [
      "Find a comfortable seated position",
      "Set an intention for your day",
      "Focus on your breath for 2 minutes",
      "Notice any thoughts without judgment",
      "Return to your breath when distracted",
      "End with gratitude for the new day"
    ],
    benefits: ["Sets positive tone", "Increases focus", "Reduces morning stress", "Improves mood"],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 2,
    title: "Stress Relief Meditation",
    duration: "15 minutes",
    type: "Body Scan",
    description: "Release tension and find calm in the present moment.",
    instructions: [
      "Lie down comfortably",
      "Take 3 deep breaths",
      "Scan your body from head to toe",
      "Notice areas of tension",
      "Breathe into tense areas",
      "Visualize tension leaving your body",
      "End with peaceful breathing"
    ],
    benefits: ["Reduces stress", "Relaxes muscles", "Calms the mind", "Improves sleep"],
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 3,
    title: "Sleep Preparation",
    duration: "20 minutes",
    type: "Progressive Relaxation",
    description: "Wind down and prepare your mind and body for restful sleep.",
    instructions: [
      "Get into your sleeping position",
      "Close your eyes and relax",
      "Start progressive muscle relaxation",
      "Focus on your breathing",
      "Visualize a peaceful place",
      "Let go of the day's worries",
      "Drift into peaceful sleep"
    ],
    benefits: ["Improves sleep quality", "Reduces insomnia", "Relaxes body", "Calms racing thoughts"],
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 4,
    title: "Focus & Concentration",
    duration: "12 minutes",
    type: "Breath Focus",
    description: "Enhance your ability to concentrate and maintain attention.",
    instructions: [
      "Sit with spine straight",
      "Choose a focus point (breath, candle, sound)",
      "Gently focus your attention",
      "When mind wanders, return to focus",
      "Practice without judgment",
      "Build concentration gradually",
      "End with appreciation for your focus"
    ],
    benefits: ["Improves concentration", "Reduces distractions", "Enhances productivity", "Builds mental discipline"],
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center"
  }
];

export default function ExercisesPage() {
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [selectedMeditation, setSelectedMeditation] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);

  const startTimer = (duration: number) => {
    setTimeRemaining(duration * 60); // Convert minutes to seconds
    setIsTimerActive(true);
  };

  const stopTimer = () => {
    setIsTimerActive(false);
    setTimeRemaining(0);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeRemaining(0);
  };

  const markExerciseComplete = (exerciseId: number) => {
    if (!completedExercises.includes(exerciseId)) {
      setCompletedExercises([...completedExercises, exerciseId]);
    }
  };

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="flex justify-center items-start h-full">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-headline flex items-center justify-center gap-2">
            <Brain className="h-8 w-8" /> Mental Health Exercises & Meditation
          </h1>
          <p className="text-muted-foreground mt-2">
            Improve your mental well-being with guided exercises and meditation sessions.
          </p>
        </div>

        {/* Timer Section */}
        {(isTimerActive || timeRemaining > 0) && (
          <Card className="bg-primary/10 border-primary/20">
            <CardHeader className="flex flex-row items-start space-x-4">
              <Timer className="h-8 w-8 text-primary mt-1" />
              <div>
                <CardTitle className="font-headline">Session Timer</CardTitle>
                <CardDescription className="pt-2 text-foreground/80">
                  Track your exercise or meditation session time.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-mono font-bold text-primary">
                  {formatTime(timeRemaining)}
                </div>
                <div className="flex justify-center gap-2">
                  {!isTimerActive ? (
                    <Button onClick={() => setIsTimerActive(true)}>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={stopTimer}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button variant="outline" onClick={resetTimer}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="exercises" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exercises">Mental Health Exercises</TabsTrigger>
            <TabsTrigger value="meditation">Meditation Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="exercises" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Mental Health Exercises</CardTitle>
                <CardDescription>
                  Choose from a variety of exercises designed to improve your mental well-being and reduce stress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentalHealthExercises.map((exercise) => (
              <Card key={exercise.id} className="relative overflow-hidden">
                {completedExercises.includes(exercise.id) && (
                  <div className="absolute top-2 right-2 z-10">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                )}
                <div className="h-48 w-full overflow-hidden">
                  <img 
                    src={exercise.image} 
                    alt={exercise.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {exercise.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {exercise.duration}
                    </Badge>
                    <Badge className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                      {exercise.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {exercise.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Benefits
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {exercise.benefits.map((benefit, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedExercise(exercise.id)}
                        className="flex-1"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Steps
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const duration = parseInt(exercise.duration);
                          startTimer(duration);
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meditation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Meditation Sessions</CardTitle>
                <CardDescription>
                  Guided meditation sessions to help you relax, focus, and improve your mental clarity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meditationSessions.map((session) => (
              <Card key={session.id} className="relative overflow-hidden">
                <div className="h-48 w-full overflow-hidden">
                  <img 
                    src={session.image} 
                    alt={session.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {session.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {session.duration}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {session.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Benefits
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {session.benefits.map((benefit, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedMeditation(session.id)}
                        className="flex-1"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Instructions
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const duration = parseInt(session.duration);
                          startTimer(duration);
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Exercise Details Modal */}
        {selectedExercise && (
          <Card className="fixed inset-4 z-50 overflow-auto bg-background border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline">
                  {mentalHealthExercises.find(e => e.id === selectedExercise)?.title}
                </CardTitle>
                <Button variant="outline" onClick={() => setSelectedExercise(null)}>
                  Close
                </Button>
              </div>
              <CardDescription>
                {mentalHealthExercises.find(e => e.id === selectedExercise)?.description}
              </CardDescription>
            </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Step-by-Step Instructions
              </h3>
              <ol className="space-y-3">
                {mentalHealthExercises.find(e => e.id === selectedExercise)?.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1 shrink-0">
                      {index + 1}
                    </Badge>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  const exercise = mentalHealthExercises.find(e => e.id === selectedExercise);
                  if (exercise) {
                    const duration = parseInt(exercise.duration);
                    startTimer(duration);
                  }
                }}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Exercise
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  markExerciseComplete(selectedExercise);
                  setSelectedExercise(null);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

        {/* Meditation Details Modal */}
        {selectedMeditation && (
          <Card className="fixed inset-4 z-50 overflow-auto bg-background border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline">
                  {meditationSessions.find(m => m.id === selectedMeditation)?.title}
                </CardTitle>
                <Button variant="outline" onClick={() => setSelectedMeditation(null)}>
                  Close
                </Button>
              </div>
              <CardDescription>
                {meditationSessions.find(m => m.id === selectedMeditation)?.description}
              </CardDescription>
            </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Wind className="h-5 w-5" />
                Meditation Instructions
              </h3>
              <ol className="space-y-3">
                {meditationSessions.find(m => m.id === selectedMeditation)?.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1 shrink-0">
                      {index + 1}
                    </Badge>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  const session = meditationSessions.find(m => m.id === selectedMeditation);
                  if (session) {
                    const duration = parseInt(session.duration);
                    startTimer(duration);
                  }
                }}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Meditation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}

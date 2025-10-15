'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Timer, Play, Pause, RefreshCw, Settings } from 'lucide-react';
import { BreakAlertDialog } from './BreakAlertDialog';
import { useTimer } from '@/contexts/TimerContext';

const DEFAULT_WORK_DURATION = 10800; // 3 hours in seconds
const DEFAULT_BREAK_DURATION = 1800; // 30 minutes in seconds

export function WorkSessionTimer() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { workDurationSeconds, breakDurationSeconds, timeLeftSeconds, isActive, phase, autoStartNextWork, setWorkDurationMinutes, setBreakDurationMinutes, setAutoStartNextWork, start, pause, reset } = useTimer();

  const toggleTimer = () => {
    if (isActive) {
      pause();
    } else {
      start();
    }
  };

  const handleWorkDurationChange = (value: string) => {
    const minutes = parseInt(value) || 0;
    setWorkDurationMinutes(minutes);
  };

  const handleBreakDurationChange = (value: string) => {
    const minutes = parseInt(value) || 0;
    setBreakDurationMinutes(minutes);
  };

  const handleCloseAlert = () => {
    // Close the dialog but keep the break timer running
    setIsAlertOpen(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Open break dialog when work phase finishes and break starts
  useEffect(() => {
    if (phase === 'break' && isActive) {
      setIsAlertOpen(true);
    }
  }, [phase, isActive]);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Timer className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Work Session Timer ({phase === 'work' ? 'Work' : 'Break'})</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <p className="text-muted-foreground text-center">
          Start the timer to track your session. We'll remind you to take a break after a continuous session.
        </p>
        
        {showSettings && (
          <div className="w-full space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-center">Timer Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work-duration">Work Duration (minutes)</Label>
                <Input
                  id="work-duration"
                  type="number"
                  min="5"
                  max="480"
                  value={Math.floor(workDurationSeconds / 60)}
                  onChange={(e) => handleWorkDurationChange(e.target.value)}
                  disabled={isActive}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                <Input
                  id="break-duration"
                  type="number"
                  min="1"
                  max="60"
                  value={Math.floor(breakDurationSeconds / 60)}
                  onChange={(e) => handleBreakDurationChange(e.target.value)}
                  disabled={isActive}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Settings are saved automatically. Timer must be stopped to change duration.
            </p>
          </div>
        )}
        <div className="relative h-40 w-40">
           <svg className="absolute top-0 left-0 h-full w-full" viewBox="0 0 100 100">
                <circle className="text-secondary" strokeWidth="7" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                className="text-primary"
                strokeWidth="7"
                strokeDasharray="283"
                strokeDashoffset={(phase === 'work' ? workDurationSeconds : breakDurationSeconds) > 0 ? 283 - (timeLeftSeconds / (phase === 'work' ? workDurationSeconds : breakDurationSeconds)) * 283 : 283}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums leading-tight w-full text-center">{formatTime(timeLeftSeconds)}</span>
            </div>
        </div>
        <div className="flex space-x-4">
          <Button onClick={toggleTimer} size="lg">
            {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={reset} variant="outline" size="lg">
            <RefreshCw className="mr-2 h-5 w-5" />
            Reset
          </Button>
        </div>
      </CardContent>
      <BreakAlertDialog 
        open={isAlertOpen} 
        onContinue={handleCloseAlert}
        onClose={handleCloseAlert}
        breakDuration={breakDurationSeconds}
        autoStartNextWork={autoStartNextWork}
        onToggleAutoStart={setAutoStartNextWork}
      />
    </Card>
  );
}

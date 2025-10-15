'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

type TimerState = {
  workDurationSeconds: number;
  breakDurationSeconds: number;
  isActive: boolean;
  endTimestampMs: number | null; // when the current phase ends
  phase: 'work' | 'break';
  autoStartNextWork: boolean;
};

type TimerContextValue = {
  workDurationSeconds: number;
  breakDurationSeconds: number;
  timeLeftSeconds: number;
  isActive: boolean;
  phase: 'work' | 'break';
  autoStartNextWork: boolean;
  setWorkDurationMinutes: (minutes: number) => void;
  setBreakDurationMinutes: (minutes: number) => void;
  setAutoStartNextWork: (auto: boolean) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
};

const DEFAULT_WORK_SECONDS = parseInt(import.meta.env.VITE_DEFAULT_WORK_DURATION || "10800"); // 3h
const DEFAULT_BREAK_SECONDS = parseInt(import.meta.env.VITE_DEFAULT_BREAK_DURATION || "1800"); // 30m
const STORAGE_KEY = 'work-session-timer-v1';

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

function loadState(): TimerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { workDurationSeconds: DEFAULT_WORK_SECONDS, breakDurationSeconds: DEFAULT_BREAK_SECONDS, isActive: false, endTimestampMs: null, phase: 'work', autoStartNextWork: false };
    const parsed = JSON.parse(raw) as TimerState;
    return {
      workDurationSeconds: parsed.workDurationSeconds ?? DEFAULT_WORK_SECONDS,
      breakDurationSeconds: parsed.breakDurationSeconds ?? DEFAULT_BREAK_SECONDS,
      isActive: Boolean(parsed.isActive),
      endTimestampMs: parsed.endTimestampMs ?? null,
      phase: parsed.phase === 'break' ? 'break' : 'work',
      autoStartNextWork: Boolean(parsed.autoStartNextWork),
    };
  } catch {
    return { workDurationSeconds: DEFAULT_WORK_SECONDS, breakDurationSeconds: DEFAULT_BREAK_SECONDS, isActive: false, endTimestampMs: null, phase: 'work', autoStartNextWork: false };
  }
}

function saveState(state: TimerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [workDurationSeconds, setWorkDurationSeconds] = useState<number>(DEFAULT_WORK_SECONDS);
  const [breakDurationSeconds, setBreakDurationSeconds] = useState<number>(DEFAULT_BREAK_SECONDS);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [endTimestampMs, setEndTimestampMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  const [autoStartNextWork, setAutoStartNextWork] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  // Initialize from storage once (client only)
  useEffect(() => {
    const state = loadState();
    setWorkDurationSeconds(state.workDurationSeconds);
    setBreakDurationSeconds(state.breakDurationSeconds);
    setIsActive(state.isActive);
    setEndTimestampMs(state.endTimestampMs);
    setPhase(state.phase);
    setAutoStartNextWork(state.autoStartNextWork);
  }, []);

  // Persist on change
  useEffect(() => {
    saveState({ workDurationSeconds, breakDurationSeconds, isActive, endTimestampMs, phase, autoStartNextWork });
  }, [workDurationSeconds, breakDurationSeconds, isActive, endTimestampMs, phase, autoStartNextWork]);

  // Global ticking based on wall clock, not component mount
  useEffect(() => {
    if (intervalRef.current != null) return;
    intervalRef.current = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const timeLeftSeconds = useMemo(() => {
    const base = phase === 'work' ? workDurationSeconds : breakDurationSeconds;
    if (!isActive || endTimestampMs == null) return base;
    const remaining = Math.max(0, Math.floor((endTimestampMs - nowMs) / 1000));
    return remaining;
  }, [isActive, endTimestampMs, nowMs, workDurationSeconds, breakDurationSeconds, phase]);

  // Auto transition when reaches zero
  useEffect(() => {
    if (!isActive) return;
    if (timeLeftSeconds <= 0) {
      if (phase === 'work') {
        // Switch to break automatically
        setPhase('break');
        setIsActive(true);
        setEndTimestampMs(Date.now() + breakDurationSeconds * 1000);
        triggerBreakStartNotification();
      } else {
        // Break finished -> stop and return to work phase (not started)
        if (autoStartNextWork) {
          setPhase('work');
          setIsActive(true);
          setEndTimestampMs(Date.now() + workDurationSeconds * 1000);
        } else {
          setIsActive(false);
          setEndTimestampMs(null);
          setPhase('work');
        }
        triggerBreakEndNotification();
        // reset work duration to configured value (already stored in workDurationSeconds)
      }
    }
  }, [isActive, timeLeftSeconds, phase, breakDurationSeconds]);

  // Notify once when timer completes
  const hasNotifiedRef = useRef<boolean>(false);
  const prevTimeLeftRef = useRef<number>(timeLeftSeconds);
  useEffect(() => {
    const prev = prevTimeLeftRef.current;
    if (prev > 0 && timeLeftSeconds === 0) {
      // fire notification + sound once
      if (!hasNotifiedRef.current) {
        hasNotifiedRef.current = true;
        triggerCompletionNotification();
      }
    }
    if (timeLeftSeconds > 0) {
      hasNotifiedRef.current = false; // reset for next run
    }
    prevTimeLeftRef.current = timeLeftSeconds;
  }, [timeLeftSeconds]);

  function triggerCompletionNotification() {
    try {
      // Desktop notification
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          const suggestions = [
            'Close your eyes and rest for 1 minute',
            'Stand up and stretch your legs',
            'Take a short walk and get fresh air',
            'Drink a glass of water',
            'Do 10 gentle neck rolls',
            'Look 20 ft away for 20 seconds (20-20-20 rule)',
            'Have a healthy snack (nuts, fruit)',
            'Relax your shoulders and breathe deeply',
          ];
          // pick two unique suggestions
          const shuffled = suggestions.sort(() => Math.random() - 0.5);
          const picked = shuffled.slice(0, 2);
          const body = `Time for a break! Great job staying focused.\n• ${picked[0]}\n• ${picked[1]}`;

          const n = new Notification('Work session complete', {
            body,
            icon: '/favicon.ico',
            silent: true, // we will play our own sound
          });
          n.onclick = () => {
            window.focus();
            n.close();
          };
        }
      }
    } catch {}
    // Play a short chime using Web Audio API (works even in background if allowed)
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(880, audioCtx.currentTime);
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      o.connect(g).connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + 1.25);
      // Follow-up higher tone
      const o2 = audioCtx.createOscillator();
      const g2 = audioCtx.createGain();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.2);
      g2.gain.setValueAtTime(0.0001, audioCtx.currentTime + 0.2);
      g2.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.22);
      g2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.0);
      o2.connect(g2).connect(audioCtx.destination);
      o2.start(audioCtx.currentTime + 0.2);
      o2.stop(audioCtx.currentTime + 1.05);
    } catch {}
  }

  function triggerBreakStartNotification() {
    try {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          const n = new Notification('Break started', {
            body: 'Time to rest. Your break timer is running.',
            icon: '/favicon.ico',
            silent: true,
          });
          n.onclick = () => { window.focus(); n.close(); };
        }
      }
    } catch {}
  }

  function triggerBreakEndNotification() {
    try {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          const n = new Notification('Break complete', {
            body: 'Ready to get back to work. Start your next session when ready.',
            icon: '/favicon.ico',
            silent: true,
          });
          n.onclick = () => { window.focus(); n.close(); };
        }
      }
    } catch {}
  }

  // Actions
  const start = () => {
    if (isActive) return;
    // Request notification permission non-blocking
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch {}
    const base = phase === 'work' ? workDurationSeconds : breakDurationSeconds;
    const endMs = Date.now() + base * 1000;
    setIsActive(true);
    setEndTimestampMs(endMs);
  };

  const pause = () => {
    if (!isActive) return;
    // compute remaining and keep it as the new duration base
    if (endTimestampMs != null) {
      const remaining = Math.max(0, Math.floor((endTimestampMs - Date.now()) / 1000));
      if (phase === 'work') setWorkDurationSeconds(remaining); else setBreakDurationSeconds(remaining);
    }
    setIsActive(false);
    setEndTimestampMs(null);
  };

  const reset = () => {
    setIsActive(false);
    setEndTimestampMs(null);
    // reset back to configured durations, not remaining
    const state = loadState();
    setWorkDurationSeconds(state.workDurationSeconds || DEFAULT_WORK_SECONDS);
    setBreakDurationSeconds(state.breakDurationSeconds || DEFAULT_BREAK_SECONDS);
    setPhase('work');
  };

  const setWorkDurationMinutes = (minutes: number) => {
    const seconds = Math.max(0, Math.floor(minutes) * 60);
    setWorkDurationSeconds(seconds);
    if (!isActive) {
      setEndTimestampMs(null);
    }
  };

  const setBreakDurationMinutes = (minutes: number) => {
    const seconds = Math.max(0, Math.floor(minutes) * 60);
    setBreakDurationSeconds(seconds);
  };

  const value: TimerContextValue = {
    workDurationSeconds,
    breakDurationSeconds,
    timeLeftSeconds,
    isActive,
    phase,
    autoStartNextWork,
    setWorkDurationMinutes,
    setBreakDurationMinutes,
    setAutoStartNextWork,
    start,
    pause,
    reset,
  };

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}



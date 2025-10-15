import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useAuth } from '@/contexts/AuthContext';

type ScreenTimeContextValue = {
  todayActiveSeconds: number;
  resetToday: () => void;
};

const ScreenTimeContext = createContext<ScreenTimeContextValue | undefined>(undefined);

const STORAGE_KEY = 'breeze-screen-time-today-v1';

function getStartOfDayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function loadPersisted(): { day: number; seconds: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { day: getStartOfDayMs(), seconds: 0 };
    const parsed = JSON.parse(raw) as { day?: number; seconds?: number };
    return { day: parsed.day ?? getStartOfDayMs(), seconds: parsed.seconds ?? 0 };
  } catch {
    return { day: getStartOfDayMs(), seconds: 0 };
  }
}

function savePersisted(day: number, seconds: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ day, seconds }));
  } catch {}
}

export function ScreenTimeProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { getActivityStats, activityData } = useActivityTracker();
  const [todayActiveSeconds, setTodayActiveSeconds] = useState<number>(0);
  const [dayMs, setDayMs] = useState<number>(getStartOfDayMs());
  const mountedRef = useRef<boolean>(false);

  // Initialize from storage
  useEffect(() => {
    const persisted = loadPersisted();
    const today = getStartOfDayMs();
    if (persisted.day === today) {
      setDayMs(today);
      setTodayActiveSeconds(persisted.seconds);
    } else {
      setDayMs(today);
      setTodayActiveSeconds(0);
      savePersisted(today, 0);
    }
    mountedRef.current = true;
  }, []);

  // Reset when user logs out
  useEffect(() => {
    if (!currentUser) {
      const today = getStartOfDayMs();
      setDayMs(today);
      setTodayActiveSeconds(0);
      savePersisted(today, 0);
    }
  }, [currentUser]);

  // Tick every second globally; infer activity from visibility/focus only (ignore idle)
  useEffect(() => {
    const interval = window.setInterval(() => {
      const today = getStartOfDayMs();
      if (today !== dayMs) {
        setDayMs(today);
        setTodayActiveSeconds(0);
        savePersisted(today, 0);
        return;
      }

      // Count as active whenever tab is visible and window is focused
      const isActive = !document.hidden && document.hasFocus();
      if (isActive) {
        setTodayActiveSeconds((s) => {
          const next = s + 1;
          savePersisted(dayMs, next);
          return next;
        });
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [dayMs]);

  const value = useMemo<ScreenTimeContextValue>(() => ({
    todayActiveSeconds,
    resetToday: () => {
      const today = getStartOfDayMs();
      setDayMs(today);
      setTodayActiveSeconds(0);
      savePersisted(today, 0);
    }
  }), [todayActiveSeconds]);

  return (
    <ScreenTimeContext.Provider value={value}>{children}</ScreenTimeContext.Provider>
  );
}

export function useScreenTime() {
  const ctx = useContext(ScreenTimeContext);
  if (!ctx) throw new Error('useScreenTime must be used within ScreenTimeProvider');
  return ctx;
}



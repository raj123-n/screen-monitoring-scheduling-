import { useState, useEffect, useRef, useCallback } from 'react';

export interface MouseMoveEvent {
  x: number;
  y: number;
  pageX?: number;
  pageY?: number;
  timestamp: number;
  velocity?: number;
}

export interface ClickEvent {
  x: number;
  y: number;
  targetSelector: string;
  elementId?: string;
  button: number;
  modifiers: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
  };
  timestamp: number;
}

export interface HoverEvent {
  target: string;
  enterTime: number;
  leaveTime?: number;
  dwellMs?: number;
}

export interface ScrollEvent {
  scrollTop: number;
  scrollPct: number;
  direction: 'up' | 'down';
  speed: number;
  timestamp: number;
}

export interface KeydownEvent {
  category: 'typing' | 'navigation' | 'shortcut' | 'other';
  timestamp: number;
}

export interface VisibilityEvent {
  visible: boolean;
  focused: boolean;
  timestamp: number;
}

export interface IdleEvent {
  idleStart: number;
  idleEnd?: number;
  idleMs?: number;
}

export interface ActivityData {
  mouseMoves: MouseMoveEvent[];
  clicks: ClickEvent[];
  hovers: HoverEvent[];
  scrolls: ScrollEvent[];
  keydowns: KeydownEvent[];
  visibility: VisibilityEvent[];
  idle: IdleEvent[];
  currentHover?: HoverEvent;
  isIdle: boolean;
  lastActivity: number;
}

interface ActivityTrackerOptions {
  throttleInterval?: number;
  idleThreshold?: number;
  maxEvents?: number;
  enableKeydown?: boolean;
}

const DEFAULT_OPTIONS: ActivityTrackerOptions = {
  throttleInterval: 100, // ms
  idleThreshold: 30000, // 30 seconds
  maxEvents: 1000,
  enableKeydown: false, // disabled by default for privacy
};

export function useActivityTracker(options: ActivityTrackerOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [activityData, setActivityData] = useState<ActivityData>({
    mouseMoves: [],
    clicks: [],
    hovers: [],
    scrolls: [],
    keydowns: [],
    visibility: [],
    idle: [],
    isIdle: false,
    lastActivity: Date.now(),
  });

  const throttleRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMouseMoveRef = useRef<MouseMoveEvent | null>(null);
  const currentHoverRef = useRef<HoverEvent | null>(null);
  const lastScrollTopRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(0);

  // Throttled mouse move handler
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (throttleRef.current) return;

    throttleRef.current = setTimeout(() => {
      const mouseEvent: MouseMoveEvent = {
        x: event.clientX,
        y: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
        timestamp: Date.now(),
      };

      // Calculate velocity if we have a previous event
      if (lastMouseMoveRef.current) {
        const timeDiff = mouseEvent.timestamp - lastMouseMoveRef.current.timestamp;
        const distance = Math.sqrt(
          Math.pow(mouseEvent.x - lastMouseMoveRef.current.x, 2) +
          Math.pow(mouseEvent.y - lastMouseMoveRef.current.y, 2)
        );
        mouseEvent.velocity = distance / timeDiff;
      }

      lastMouseMoveRef.current = mouseEvent;

      setActivityData(prev => ({
        ...prev,
        mouseMoves: [...prev.mouseMoves.slice(-config.maxEvents! + 1), mouseEvent],
        lastActivity: mouseEvent.timestamp,
        isIdle: false,
      }));

      throttleRef.current = null;
    }, config.throttleInterval);
  }, [config.throttleInterval, config.maxEvents]);

  // Click handler
  const handleClick = useCallback((event: MouseEvent) => {
    const t = event.target as unknown;
    if (!(t instanceof Element)) return;
    const target = t as Element;
    const clickEvent: ClickEvent = {
      x: event.clientX,
      y: event.clientY,
      targetSelector: (target.tagName ? target.tagName.toLowerCase() : 'unknown') + 
        (target.id ? `#${target.id}` : '') + 
        (typeof target.className === 'string' && target.className.length ? `.${target.className.split(' ').join('.')}` : ''),
      elementId: target.id || undefined,
      button: event.button,
      modifiers: {
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        meta: event.metaKey,
      },
      timestamp: Date.now(),
    };

    setActivityData(prev => ({
      ...prev,
      clicks: [...prev.clicks.slice(-config.maxEvents! + 1), clickEvent],
      lastActivity: clickEvent.timestamp,
      isIdle: false,
    }));
  }, [config.maxEvents]);

  // Hover handlers
  const handleMouseEnter = useCallback((event: MouseEvent) => {
    const t = event.target as unknown;
    if (!(t instanceof Element)) return;
    const target = t as Element;
    const hoverEvent: HoverEvent = {
      target: (target.tagName ? target.tagName.toLowerCase() : 'unknown') + 
        (target.id ? `#${target.id}` : '') + 
        (typeof target.className === 'string' && target.className.length ? `.${target.className.split(' ').join('.')}` : ''),
      enterTime: Date.now(),
    };

    currentHoverRef.current = hoverEvent;
    setActivityData(prev => ({
      ...prev,
      currentHover: hoverEvent,
      lastActivity: hoverEvent.enterTime,
      isIdle: false,
    }));
  }, []);

  const handleMouseLeave = useCallback((event: MouseEvent) => {
    if (currentHoverRef.current) {
      const leaveTime = Date.now();
      const dwellMs = leaveTime - currentHoverRef.current.enterTime;
      
      const completedHover: HoverEvent = {
        ...currentHoverRef.current,
        leaveTime,
        dwellMs,
      };

      setActivityData(prev => ({
        ...prev,
        hovers: [...prev.hovers.slice(-config.maxEvents! + 1), completedHover],
        currentHover: undefined,
        lastActivity: leaveTime,
        isIdle: false,
      }));

      currentHoverRef.current = null;
    }
  }, [config.maxEvents]);

  // Scroll handler
  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    const currentTime = Date.now();
    
    const direction: 'up' | 'down' = scrollTop > lastScrollTopRef.current ? 'down' : 'up';
    const timeDiff = currentTime - lastScrollTimeRef.current;
    const speed = timeDiff > 0 ? Math.abs(scrollTop - lastScrollTopRef.current) / (timeDiff / 1000) : 0;

    const scrollEvent: ScrollEvent = {
      scrollTop,
      scrollPct,
      direction,
      speed,
      timestamp: currentTime,
    };

    lastScrollTopRef.current = scrollTop;
    lastScrollTimeRef.current = currentTime;

    setActivityData(prev => ({
      ...prev,
      scrolls: [...prev.scrolls.slice(-config.maxEvents! + 1), scrollEvent],
      lastActivity: currentTime,
      isIdle: false,
    }));
  }, [config.maxEvents]);

  // Keydown handler (optional, privacy-focused)
  const handleKeydown = useCallback((event: KeyboardEvent) => {
    if (!config.enableKeydown) return;

    let category: 'typing' | 'navigation' | 'shortcut' | 'other' = 'other';

    // Determine key category
    if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
      category = 'typing';
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
      category = 'navigation';
    } else if (event.ctrlKey || event.metaKey || event.altKey) {
      category = 'shortcut';
    }

    const keydownEvent: KeydownEvent = {
      category,
      timestamp: Date.now(),
    };

    setActivityData(prev => ({
      ...prev,
      keydowns: [...prev.keydowns.slice(-config.maxEvents! + 1), keydownEvent],
      lastActivity: keydownEvent.timestamp,
      isIdle: false,
    }));
  }, [config.enableKeydown, config.maxEvents]);

  // Visibility and focus handlers
  const handleVisibilityChange = useCallback(() => {
    const visibilityEvent: VisibilityEvent = {
      visible: !document.hidden,
      focused: document.hasFocus(),
      timestamp: Date.now(),
    };

    setActivityData(prev => ({
      ...prev,
      visibility: [...prev.visibility.slice(-config.maxEvents! + 1), visibilityEvent],
      lastActivity: visibilityEvent.timestamp,
      isIdle: false,
    }));
  }, [config.maxEvents]);

  const handleFocusChange = useCallback(() => {
    const visibilityEvent: VisibilityEvent = {
      visible: !document.hidden,
      focused: document.hasFocus(),
      timestamp: Date.now(),
    };

    setActivityData(prev => ({
      ...prev,
      visibility: [...prev.visibility.slice(-config.maxEvents! + 1), visibilityEvent],
      lastActivity: visibilityEvent.timestamp,
      isIdle: false,
    }));
  }, [config.maxEvents]);

  // Idle detection
  const resetIdleTimer = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    idleTimeoutRef.current = setTimeout(() => {
      const idleStart = Date.now();
      setActivityData(prev => ({
        ...prev,
        isIdle: true,
        idle: [...prev.idle.slice(-config.maxEvents! + 1), { idleStart }],
      }));
    }, config.idleThreshold);
  }, [config.idleThreshold, config.maxEvents]);

  // Activity reset function
  const resetActivity = useCallback(() => {
    setActivityData({
      mouseMoves: [],
      clicks: [],
      hovers: [],
      scrolls: [],
      keydowns: [],
      visibility: [],
      idle: [],
      isIdle: false,
      lastActivity: Date.now(),
    });
  }, []);

  // Get activity statistics
  const getActivityStats = useCallback(() => {
    const now = Date.now();
    const lastMinute = now - 60000;
    const lastHour = now - 3600000;

    const recentMoves = activityData.mouseMoves.filter(m => m.timestamp > lastMinute);
    const recentClicks = activityData.clicks.filter(c => c.timestamp > lastMinute);
    const recentScrolls = activityData.scrolls.filter(s => s.timestamp > lastMinute);

    return {
      totalEvents: activityData.mouseMoves.length + activityData.clicks.length + 
                   activityData.hovers.length + activityData.scrolls.length + 
                   activityData.keydowns.length,
      eventsLastMinute: recentMoves.length + recentClicks.length + recentScrolls.length,
      mouseMovesLastMinute: recentMoves.length,
      clicksLastMinute: recentClicks.length,
      scrollsLastMinute: recentScrolls.length,
      isCurrentlyIdle: activityData.isIdle,
      currentHover: activityData.currentHover,
      averageVelocity: recentMoves.length > 0 
        ? recentMoves.reduce((sum, m) => sum + (m.velocity || 0), 0) / recentMoves.length 
        : 0,
    };
  }, [activityData]);

  // Setup event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocusChange);
    window.addEventListener('blur', handleFocusChange);

    if (config.enableKeydown) {
      document.addEventListener('keydown', handleKeydown);
    }

    resetIdleTimer();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocusChange);
      window.removeEventListener('blur', handleFocusChange);

      if (config.enableKeydown) {
        document.removeEventListener('keydown', handleKeydown);
      }

      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [handleMouseMove, handleClick, handleMouseEnter, handleMouseLeave, handleScroll, 
      handleVisibilityChange, handleFocusChange, handleKeydown, config.enableKeydown, resetIdleTimer]);

  // Reset idle timer on any activity
  useEffect(() => {
    if (!activityData.isIdle) {
      resetIdleTimer();
    }
  }, [activityData.lastActivity, activityData.isIdle, resetIdleTimer]);

  return {
    activityData,
    getActivityStats,
    resetActivity,
    isTracking: true,
  };
}

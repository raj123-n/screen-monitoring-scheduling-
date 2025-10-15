import { useEffect, useRef } from "react";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useDatabase } from "@/hooks/useDatabase";
import { useAuth } from "@/contexts/AuthContext";

// Runs globally after login to persist activity tracking across routes
export default function BackgroundActivityTracker() {
  const { currentUser } = useAuth();
  const { getActivityStats } = useActivityTracker({ enableKeydown: false });
  const { updateUserStatistics, saveUserActivity, totalWorkTime } = useDatabase();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const run = async () => {
      const stats = getActivityStats();
      const isVisible = !document.hidden;
      const isFocused = document.hasFocus();
      const hasEvents = stats.eventsLastMinute > 0 && !stats.isCurrentlyIdle;
      const isActive = hasEvents && isVisible && isFocused;
      const isAway = !isVisible || !isFocused;
      const activityType = isActive ? "work" : isAway ? "away" : "idle";

      try {
        // Save a heartbeat of activity even if minimal, so we track continuous usage
        await saveUserActivity({
          activityType,
          duration: 1,
          details: {
            mouseMovements: stats.mouseMovesLastMinute,
            clicks: stats.clicksLastMinute,
            scrolls: stats.scrollsLastMinute,
            averageVelocity: stats.averageVelocity,
            visible: isVisible,
            focused: isFocused,
          },
        });

        if (isActive) {
          await updateUserStatistics({
            totalWorkTime: totalWorkTime + 1,
            lastActive: Date.now(),
          });
        }
      } catch (err) {
        // fail silently in background
        // eslint-disable-next-line no-console
        console.debug("Background activity save failed", err);
      }
    };

    if (intervalRef.current == null) {
      intervalRef.current = window.setInterval(run, 60000);
    }

    // run once quickly after mount to avoid waiting full minute
    const timeout = window.setTimeout(run, 3000);

    const handlePageHide = () => {
      try {
        const stats = getActivityStats();
        const payload = JSON.stringify({
          activityType: "visibility",
          duration: 0,
          details: { visible: !document.hidden, focused: document.hasFocus(), events: stats.eventsLastMinute },
          timestamp: Date.now(),
        });
        // best-effort flush
        if (navigator.sendBeacon) {
          // If backend existed, we would send to an endpoint. Here we no-op.
          navigator.sendBeacon("/noop-beacon", new Blob([payload], { type: "application/json" }));
        }
      } catch {}
    };

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handlePageHide);

    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      window.clearTimeout(timeout);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handlePageHide);
    };
  }, [currentUser, getActivityStats, saveUserActivity, updateUserStatistics, totalWorkTime]);

  return null;
}



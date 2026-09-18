import { useEffect } from "react";

export function useWakeLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | undefined;
    let cancelled = false;

    const request = async () => {
      try {
        sentinel = await navigator.wakeLock.request("screen");
      } catch {
        /* unsupported, denied, or low battery */
      }
    };

    void request();
    const onVisible = () => {
      if (!cancelled && document.visibilityState === "visible") void request();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void sentinel?.release();
    };
  }, [enabled]);
}

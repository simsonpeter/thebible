import { useEffect, useState } from "react";
import { bootstrapLocalBible, type ImportProgress } from "@/services/bibleImport";

/** Keep the branded splash visible long enough to read, even on warm starts. */
const MIN_SPLASH_MS = 5000;

export function useBibleInit() {
  const [progress, setProgress] = useState<ImportProgress>({ stage: "Starting…", percent: 0 });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let holdTimer: number | undefined;
    const startedAt = Date.now();

    const finishWhenReady = () => {
      if (cancelled) return;
      const remaining = MIN_SPLASH_MS - (Date.now() - startedAt);
      if (remaining <= 0) {
        setReady(true);
        return;
      }
      holdTimer = window.setTimeout(() => {
        if (!cancelled) setReady(true);
      }, remaining);
    };

    bootstrapLocalBible((next) => {
      if (!cancelled) setProgress(next);
    })
      .then(finishWhenReady)
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Bible data is not installed yet.");
        }
      });
    return () => {
      cancelled = true;
      if (holdTimer !== undefined) window.clearTimeout(holdTimer);
    };
  }, []);

  return { ready, error, progress };
}

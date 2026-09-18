import { useEffect, useState } from "react";
import { bootstrapLocalBible, type ImportProgress } from "@/services/bibleImport";

export function useBibleInit() {
  const [progress, setProgress] = useState<ImportProgress>({ stage: "Starting…", percent: 0 });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    bootstrapLocalBible((next) => {
      if (!cancelled) setProgress(next);
    })
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Bible data is not installed yet.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, error, progress };
}

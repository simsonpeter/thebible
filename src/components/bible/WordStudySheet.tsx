import { useEffect, useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { DictionaryEntryCard } from "@/components/dictionary/DictionaryEntryCard";
import { loadStrongEntries, searchStrongEntries } from "@/services/dictionaryService";
import type { StrongEntry } from "@/types/strongs";
import { cn } from "@/utils/misc";

export function WordStudySheet({
  open,
  word,
  onClose,
  onSearchTamil,
  onSearchEnglish,
  onOpenDictionary,
}: {
  open: boolean;
  word: string;
  onClose: () => void;
  onSearchTamil: (word: string) => void;
  onSearchEnglish: (word: string) => void;
  onOpenDictionary: (word: string) => void;
}) {
  const [entries, setEntries] = useState<StrongEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void loadStrongEntries()
      .then((loaded) => {
        if (!cancelled) {
          setEntries(loaded);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const hits = useMemo(() => (word.trim().length >= 2 ? searchStrongEntries(entries, word, "both") : []), [entries, word]);

  return (
    <BottomSheet open={open} title={word || "Word"} onClose={onClose}>
      <p className="mb-3 text-sm text-muted">Search this word, or look it up in Strong’s.</p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="min-h-12 rounded-2xl bg-paper-2 px-3 text-sm font-semibold dark:bg-white/5"
          onClick={() => onSearchTamil(word)}
        >
          Search Tamil
        </button>
        <button
          type="button"
          className="min-h-12 rounded-2xl bg-paper-2 px-3 text-sm font-semibold dark:bg-white/5"
          onClick={() => onSearchEnglish(word)}
        >
          Search English
        </button>
        <button
          type="button"
          className={cn("min-h-12 rounded-2xl bg-navy px-3 text-sm font-semibold text-white col-span-2")}
          onClick={() => onOpenDictionary(word)}
        >
          Open Strong Dictionary
        </button>
      </div>
      <div className="grid gap-2">
        {!ready ? <p className="text-sm text-muted">Loading Strong’s…</p> : null}
        {ready && hits.length === 0 ? <p className="text-sm text-muted">No Strong’s matches for this word.</p> : null}
        {hits.slice(0, 6).map((entry) => (
          <DictionaryEntryCard key={entry.id} entry={entry} expanded={false} onOpen={() => onOpenDictionary(entry.id)} />
        ))}
      </div>
    </BottomSheet>
  );
}

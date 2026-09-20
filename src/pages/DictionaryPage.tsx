import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { SearchBar } from "@/components/ui/SearchBar";
import { DictionaryEntryCard } from "@/components/dictionary/DictionaryEntryCard";
import { loadStrongEntries, normalizeStrongId, searchStrongEntries } from "@/services/dictionaryService";
import type { StrongEntry, StrongLanguage } from "@/types/strongs";

type DictionaryFilter = StrongLanguage | "both";

export function DictionaryPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [filter, setFilter] = useState<DictionaryFilter>("both");
  const [entries, setEntries] = useState<StrongEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadStrongEntries()
      .then((loaded) => {
        setEntries(loaded);
        setReady(true);
      })
      .catch((cause: Error) => {
        setError(cause.message);
        setReady(true);
      });
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setParams(query ? { q: query } : {});
    }, 180);
    return () => window.clearTimeout(handle);
  }, [query, setParams]);

  const hits = useMemo(() => searchStrongEntries(entries, query, filter), [entries, query, filter]);
  const selectedId = normalizeStrongId(query);
  const selected = selectedId ? hits.find((entry) => entry.id === selectedId) ?? null : null;

  return (
    <Page title="Strong's" subtitle="ஸ்ட்ராங்க்ஸ் அகராதி • Tamil dictionary" back>
      <SearchBar value={query} onChange={setQuery} placeholder="H430 • G26 • தேவன் • love" />
      <div className="mt-3 flex flex-wrap gap-2">
        {(
          [
            ["both", "All"],
            ["hebrew", "Hebrew"],
            ["greek", "Greek"],
          ] as Array<[DictionaryFilter, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`min-h-11 rounded-full px-3 text-sm ${filter === id ? "bg-navy text-white" : "bg-paper-2 dark:bg-white/5"}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        Offline Strong's Hebrew and Greek dictionary in Tamil. Look up a number or a word. This is a study aid, not
        Scripture.
      </p>
      <div className="mt-5 grid gap-3">
        {!ready ? <p className="text-sm text-muted">Loading dictionary…</p> : null}
        {error ? <p className="text-sm text-muted">{error}</p> : null}
        {ready && !error && query.trim().length < 2 ? (
          <p className="text-sm text-muted">Type H430, G26, or a Tamil or English word.</p>
        ) : null}
        {ready && query.trim().length >= 2 && hits.length === 0 ? (
          <p className="text-sm text-muted">No Strong's entries matched on this phone.</p>
        ) : null}
        {hits.map((entry) => (
          <DictionaryEntryCard
            key={entry.id}
            entry={entry}
            expanded={selected?.id === entry.id}
            onOpen={() => setQuery(entry.id)}
            onCognate={setQuery}
          />
        ))}
      </div>
    </Page>
  );
}

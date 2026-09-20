import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { SearchBar } from "@/components/ui/SearchBar";
import { SearchResult } from "@/components/search/SearchResult";
import { indexedSearch, listRecentSearches } from "@/lib/BibleSearchIndex";
import { type SearchLanguage, type SearchScope } from "@/services/searchService";
import type { SearchHit } from "@/services/searchService";
import { useSettings } from "@/hooks/useSettings";
import { parseReference } from "@/utils/referenceParser";

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [scope, setScope] = useState<SearchScope>("both");
  const [language, setLanguage] = useState<SearchLanguage>("both");
  const [exact, setExact] = useState(false);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  const jump = useMemo(() => parseReference(query), [query]);

  useEffect(() => {
    void listRecentSearches().then(setRecent);
  }, [hits]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setParams(query ? { q: query } : {});
      if (query.trim().length < 2) {
        setHits([]);
        return;
      }
      setSearching(true);
      const translationId =
        language === "ta" ? "bsi-ov" : language === "en" ? "kjv" : language === "tl" ? "tanglish" : settings.defaultTranslation;
      void indexedSearch({
        text: query,
        translationId,
        scope,
        language,
        exact,
        bookId: settings.lastBookId,
      }).then((results) => {
        setHits(results);
        setSearching(false);
      });
    }, 220);
    return () => window.clearTimeout(handle);
  }, [query, scope, language, exact, settings.defaultTranslation, settings.lastBookId, setParams]);

  return (
    <Page title="Search" subtitle="Offline search across your local Bible">
      <SearchBar value={query} onChange={setQuery} placeholder="தேவன் • God • love" />
      <div className="mt-3 flex flex-wrap gap-2">
        {(
          [
            ["ta", "Tamil"],
            ["tl", "Tanglish"],
            ["en", "English"],
            ["both", "All"],
          ] as Array<[SearchLanguage, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`min-h-11 rounded-full px-3 text-sm ${language === id ? "bg-navy text-white" : "bg-paper-2 dark:bg-white/5"}`}
            onClick={() => setLanguage(id)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className={`min-h-11 rounded-full px-3 text-sm ${exact ? "bg-navy text-white" : "bg-paper-2 dark:bg-white/5"}`}
          onClick={() => setExact((value) => !value)}
        >
          Exact phrase
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(
          [
            ["both", "All books"],
            ["ot", "Old Testament"],
            ["nt", "New Testament"],
            ["book", "Current book"],
          ] as Array<[SearchScope, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`min-h-11 rounded-full px-3 text-sm ${scope === id ? "bg-navy text-white" : "bg-paper-2 dark:bg-white/5"}`}
            onClick={() => setScope(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {jump?.chapter ? (
        <button
          type="button"
          className="mt-4 w-full rounded-2xl bg-gold-soft/70 p-3 text-left text-sm font-semibold text-navy-deep"
          onClick={() =>
            navigate(`/bible/${jump.book.id}/${jump.chapter}${jump.verse ? `?verse=${jump.verse}` : ""}`)
          }
        >
          Go to {jump.raw}
        </button>
      ) : null}
      {query.trim().length < 2 && recent.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {recent.map((item) => (
            <button
              key={item}
              type="button"
              className="min-h-11 rounded-full bg-paper-2 px-3 text-sm dark:bg-white/5"
              onClick={() => setQuery(item)}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-5 grid gap-3">
        {searching ? <p className="text-sm text-muted">Searching locally…</p> : null}
        {!searching && query.length >= 2 && hits.length === 0 ? (
          <p className="text-sm text-muted">
            No verses matched. Tamil search uses the bundled Tamil O.V. text.
          </p>
        ) : null}
        {hits.map((hit) => (
          <SearchResult
            key={hit.verse.id}
            hit={hit}
            query={query}
            onOpen={() =>
              navigate(
                `/bible/${hit.verse.bookId}/${hit.verse.chapter}?verse=${hit.verse.number}&translation=${hit.verse.translationId}`,
              )
            }
          />
        ))}
      </div>
    </Page>
  );
}

import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { SearchResult } from "@/components/search/SearchResult";
import { resolveTopicStudy, type TopicStudyResult, type TopicVerseContent } from "@/services/topicService";
import { formatReference } from "@/utils/reference";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/utils/misc";

export function TopicDetailPage() {
  const { topicId } = useParams();
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [result, setResult] = useState<TopicStudyResult | null>(null);
  const [loading, setLoading] = useState(true);

  const isStudyRoute = !topicId;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void resolveTopicStudy({
      topicId,
      query: query || undefined,
      translationId: settings.defaultTranslation,
    }).then((next) => {
      if (!cancelled) {
        setResult(next);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [topicId, query, settings.defaultTranslation]);

  if (!topicId && query.trim().length < 2) {
    return <Navigate to="/topics" replace />;
  }

  const title = result?.topic?.title ?? (query.trim() || "Topic");
  const subtitle = result?.topic?.titleTamil ?? "Related verses & content";

  return (
    <Page title={title} subtitle={subtitle} back>
      {loading ? <p className="text-sm text-muted">Loading verses…</p> : null}

      {!loading && result?.topic ? (
        <section className="mb-5 rounded-3xl border border-navy/10 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm leading-relaxed">{result.topic.summary}</p>
          <p className="tamil mt-2 text-sm text-muted">{result.topic.summaryTamil}</p>
        </section>
      ) : null}

      {!loading && isStudyRoute && result?.matchedTopics.length ? (
        <section className="mb-5">
          <h2 className="mb-2 font-semibold">Matching topics</h2>
          <div className="flex flex-wrap gap-2">
            {result.matchedTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className="min-h-10 rounded-full bg-paper-2 px-4 text-sm font-semibold dark:bg-white/5"
                onClick={() => navigate(`/topics/${topic.id}`)}
              >
                {topic.title}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && result ? (
        <>
          <section className="mb-6">
            <h2 className="mb-3 font-semibold">
              {result.topic ? "Key verses" : "Related verses"}
              {result.curated.length ? ` · ${result.curated.length}` : ""}
            </h2>
            {result.curated.length === 0 && result.related.length === 0 ? (
              <p className="text-sm text-muted">No verses found for this topic yet. Try another word.</p>
            ) : null}
            <div className="grid gap-3">
              {result.curated.map((row) => (
                <VerseContentCard
                  key={`${row.ref.bookId}-${row.ref.chapter}-${row.ref.verse}`}
                  row={row}
                  onOpen={() =>
                    navigate(
                      `/bible/${row.ref.bookId}/${row.ref.chapter}?verse=${row.ref.verse}&translation=${settings.defaultTranslation}`,
                    )
                  }
                />
              ))}
            </div>
          </section>

          {result.related.length ? (
            <section>
              <h2 className="mb-3 font-semibold">More related · {result.related.length}</h2>
              <div className="grid gap-2">
                {result.related.map((hit) => (
                  <SearchResult
                    key={`${hit.verse.id}`}
                    hit={hit}
                    query={result.query || result.topic?.title || ""}
                    onOpen={() =>
                      navigate(
                        `/bible/${hit.verse.bookId}/${hit.verse.chapter}?verse=${hit.verse.number}&translation=${hit.verse.translationId}`,
                      )
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </Page>
  );
}

function VerseContentCard({ row, onOpen }: { row: TopicVerseContent; onOpen: () => void }) {
  const hasText = Boolean(row.tamil || row.english);
  return (
    <Card onClick={onOpen}>
      <p className="text-sm font-semibold text-gold">
        {formatReference(row.ref.bookId, row.ref.chapter, row.ref.verse, "en")}
      </p>
      {row.tamil ? <p className="tamil mt-3 text-base leading-relaxed">{row.tamil.text}</p> : null}
      {row.english ? (
        <p className={cn("mt-2 text-sm leading-relaxed text-muted", !row.tamil && "text-base text-navy dark:text-paper")}>
          {row.english.text}
        </p>
      ) : null}
      {!hasText ? <p className="mt-2 text-sm text-muted">Open chapter to read this verse.</p> : null}
    </Card>
  );
}

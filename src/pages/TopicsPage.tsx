import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { findTopics, listTopics } from "@/services/topicService";

export function TopicsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    setParams(next, { replace: true });
  }, [query, setParams]);

  const topics = useMemo(() => (query.trim() ? findTopics(query) : listTopics()), [query]);

  function openStudy() {
    const trimmed = query.trim();
    if (!trimmed) return;
    const exact = findTopics(trimmed)[0];
    if (exact && (exact.title.toLowerCase() === trimmed.toLowerCase() || exact.id === trimmed.toLowerCase())) {
      navigate(`/topics/${exact.id}`);
      return;
    }
    if (exact) {
      navigate(`/topics/${exact.id}`);
      return;
    }
    navigate(`/topics/study?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <Page title="Topics" subtitle="Type a topic — get related verses & content" back>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Faith, prayer, பயம், healing…"
            onSubmit={openStudy}
          />
        </div>
        <Button className="shrink-0" disabled={query.trim().length < 2} onClick={openStudy}>
          Study topic
        </Button>
      </div>

      {query.trim() && topics.length === 0 ? (
        <Card onClick={openStudy}>
          <p className="font-semibold">Search the Bible for “{query.trim()}”</p>
          <p className="mt-1 text-sm text-muted">Show related verses and text offline.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {topics.map((topic) => (
            <Card key={topic.id} onClick={() => navigate(`/topics/${topic.id}`)}>
              <p className="font-semibold">{topic.title}</p>
              <p className="tamil mt-1 text-sm text-muted">{topic.titleTamil}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{topic.summary}</p>
              <p className="mt-1 text-xs text-muted">{topic.verses.length} curated verses</p>
            </Card>
          ))}
          {query.trim().length >= 2 ? (
            <Card onClick={() => navigate(`/topics/study?q=${encodeURIComponent(query.trim())}`)}>
              <p className="font-semibold">Also search Bible text for “{query.trim()}”</p>
              <p className="mt-1 text-sm text-muted">Extra related verses beyond the curated list.</p>
            </Card>
          ) : null}
        </div>
      )}
    </Page>
  );
}

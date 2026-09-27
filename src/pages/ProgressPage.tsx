import { useEffect, useState } from "react";
import { Page } from "@/components/layout/Page";
import { ProgressCard } from "@/components/ui/ProgressCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getProgressSummary } from "@/services/progressService";
import { listRecentHistory, clearHistory } from "@/services/historyService";
import { getReadingStreak, listFinishedBooks } from "@/services/streakService";
import { formatReference } from "@/utils/reference";
import { translationUiLanguage } from "@/config/translations";
import { bookDisplayName } from "@/data/books";
import type { ReadingHistoryRecord } from "@/types/userData";
import { useNavigate } from "react-router-dom";

export function ProgressPage() {
  const [summary, setSummary] = useState({ ot: 0, nt: 0, whole: 0, chaptersRead: 0, booksOpened: 0 });
  const [recent, setRecent] = useState<ReadingHistoryRecord[]>([]);
  const [streak, setStreak] = useState({ current: 0, readToday: false });
  const [finished, setFinished] = useState<string[]>([]);
  const navigate = useNavigate();

  async function reload() {
    setSummary(await getProgressSummary());
    setRecent(await listRecentHistory(20));
    setStreak(await getReadingStreak());
    setFinished(await listFinishedBooks());
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <Page title="Bible Progress" subtitle="Local reading progress only">
      <Card className="mb-4">
        <p className="text-xs tracking-[0.25em] text-gold uppercase">Streak</p>
        <p className="mt-2 text-2xl font-semibold">{streak.current} day{streak.current === 1 ? "" : "s"}</p>
        <p className="mt-1 text-sm text-muted">{streak.readToday ? "You read today." : "Open a chapter to keep your streak."}</p>
      </Card>
      <div className="grid gap-3">
        <ProgressCard title="Old Testament" percent={summary.ot} />
        <ProgressCard title="New Testament" percent={summary.nt} />
        <ProgressCard
          title="Whole Bible"
          percent={summary.whole}
          detail={`${summary.chaptersRead} chapters read • ${summary.booksOpened} books opened`}
        />
      </div>
      {finished.length ? (
        <section className="mt-6">
          <h2 className="font-semibold">Finished books</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {finished.map((id) => (
              <button
                key={id}
                type="button"
                className="min-h-10 rounded-full bg-gold-soft/70 px-3 text-sm font-semibold text-navy-deep"
                onClick={() => navigate(`/bible/${id}/1`)}
              >
                {bookDisplayName(id, "en")}
              </button>
            ))}
          </div>
        </section>
      ) : null}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-semibold">Recently Read</h2>
        <Button
          variant="ghost"
          onClick={() => {
            void clearHistory().then(reload);
          }}
        >
          Clear history
        </Button>
      </div>
      <div className="mt-3 grid gap-2">
        {recent.map((item) => (
          <button
            key={`${item.bookId}-${item.chapter}`}
            type="button"
            className="min-h-12 rounded-2xl bg-white/80 px-4 text-left dark:bg-white/5"
            onClick={() => navigate(`/bible/${item.bookId}/${item.chapter}`)}
          >
            {formatReference(item.bookId, item.chapter, undefined, translationUiLanguage(item.translationId))}
          </button>
        ))}
      </div>
    </Page>
  );
}

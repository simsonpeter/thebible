import { useEffect, useState } from "react";
import { Page } from "@/components/layout/Page";
import { ProgressCard } from "@/components/ui/ProgressCard";
import { Button } from "@/components/ui/Button";
import { getProgressSummary } from "@/services/progressService";
import { listRecentHistory, clearHistory } from "@/services/historyService";
import { formatReference } from "@/utils/reference";
import { useNavigate } from "react-router-dom";

export function ProgressPage() {
  const [summary, setSummary] = useState({ ot: 0, nt: 0, whole: 0, chaptersRead: 0, booksOpened: 0 });
  const [recent, setRecent] = useState<Array<{ bookId: string; chapter: number }>>([]);
  const navigate = useNavigate();

  async function reload() {
    setSummary(await getProgressSummary());
    setRecent(await listRecentHistory(20));
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <Page title="Bible Progress" subtitle="Local reading progress only">
      <div className="grid gap-3">
        <ProgressCard title="Old Testament" percent={summary.ot} />
        <ProgressCard title="New Testament" percent={summary.nt} />
        <ProgressCard title="Whole Bible" percent={summary.whole} detail={`${summary.chaptersRead} chapters read • ${summary.booksOpened} books opened`} />
      </div>
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
            {formatReference(item.bookId, item.chapter)}
          </button>
        ))}
      </div>
    </Page>
  );
}

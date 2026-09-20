import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OfflineBadge } from "@/components/ui/OfflineBadge";
import { ModeToggle } from "@/components/bible/TranslationSelector";
import { useSettings } from "@/hooks/useSettings";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { listRecentHistory } from "@/services/historyService";
import { listPlans, planProgress } from "@/services/planService";
import { formatReference } from "@/utils/reference";
import { cn } from "@/utils/misc";
import type { ReadingHistoryRecord } from "@/types/userData";
import { db } from "@/db";

export function HomePage() {
  const navigate = useNavigate();
  const { settings, update } = useSettings();
  const { canInstall, install } = useInstallPrompt();
  const [recent, setRecent] = useState<ReadingHistoryRecord[]>([]);
  const [planInfo, setPlanInfo] = useState({ name: "Reading Plan", day: 1, total: 365, id: "njc-plan" });
  const bookmarkCount = useLiveQuery(() => db.bookmarks.count(), []) ?? 0;
  const noteCount = useLiveQuery(() => db.notes.count(), []) ?? 0;
  const sermonCount = useLiveQuery(() => db.sermons.count(), []) ?? 0;
  const highlightCount = useLiveQuery(() => db.highlights.count(), []) ?? 0;
  const bsi = useLiveQuery(() => db.translations.get("bsi-ov"));

  useEffect(() => {
    void listRecentHistory(5).then(setRecent);
    void (async () => {
      const plans = await listPlans();
      const plan = plans.find((item) => item.id === "njc-plan") ?? plans.find((item) => item.id === "bible-1-year") ?? plans[0];
      if (!plan) return;
      const progress = await planProgress(plan.id);
      setPlanInfo({ name: plan.name, day: progress.currentDay, total: progress.total, id: plan.id });
    })();
  }, []);

  const continueBook = recent[0]?.bookId ?? settings.lastBookId;
  const continueChapter = recent[0]?.chapter ?? settings.lastChapter;
  const continueVerse = settings.lastVerse;
  const bsiReady = Boolean(bsi && !bsi.isDemo && bsi.verseCount > 0);

  return (
    <Page title="NJC Bible App" subtitle="தமிழ் வேதாகமம் • English Bible" showStatus>
      <div className="mb-5 flex items-center justify-between gap-3">
        <OfflineBadge />
        {canInstall ? (
          <Button variant="gold" onClick={() => void install()}>
            Install
          </Button>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`min-h-11 rounded-full px-3 text-sm ${settings.defaultTranslation === "bsi-ov" ? "bg-navy text-white" : "bg-paper-2 dark:bg-white/5"}`}
          onClick={() => void update({ defaultTranslation: "bsi-ov" })}
        >
          தமிழ் O.V.
        </button>
        <button
          type="button"
          className={`min-h-11 rounded-full px-3 text-sm ${settings.defaultTranslation === "kjv" ? "bg-navy text-white" : "bg-paper-2 dark:bg-white/5"}`}
          onClick={() => void update({ defaultTranslation: "kjv" })}
        >
          English KJV
        </button>
        <ModeToggle
          value={settings.readingMode}
          onChange={(mode) => void update({ readingMode: mode })}
        />
      </div>

      {!bsiReady ? (
        <p className="mb-4 rounded-2xl bg-gold-soft/50 px-4 py-3 text-sm text-navy-deep">
          Tamil Bible data has not been installed yet. It is bundled as Tamil O.V. and will load on first launch, or you
          can import book JSON files from Settings → Bible Data.
        </p>
      ) : null}

      <section className="mb-4 rounded-3xl bg-[#12263A] p-5 text-white dark:bg-[#1d3b5a]">
        <p className="text-xs tracking-[0.25em] text-[#e8d5a3] uppercase">Continue Reading</p>
        <h2 className={cn("mt-2 text-2xl font-semibold text-white", settings.defaultTranslation === "bsi-ov" && "tamil")}>
          {formatReference(continueBook, continueChapter, continueVerse || undefined, settings.defaultTranslation === "bsi-ov" ? "ta" : "en")}
        </h2>
        <Button
          variant="gold"
          className="mt-4"
          onClick={() =>
            navigate(
              `/bible/${continueBook}/${continueChapter}?translation=${settings.defaultTranslation}&mode=${settings.readingMode}${continueVerse ? `&verse=${continueVerse}` : ""}`,
            )
          }
        >
          Continue
        </Button>
      </section>

      <button
        type="button"
        className="mb-4 w-full rounded-3xl bg-[#12263A] p-5 text-left text-white dark:bg-[#1d3b5a]"
        onClick={() => navigate(`/reading-plans/${planInfo.id}`)}
      >
        <p className="text-xs tracking-[0.25em] text-[#e8d5a3] uppercase">Reading Plan</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{planInfo.name}</h3>
        <p className="mt-1 text-sm text-white/80">
          Day {planInfo.day} / {planInfo.total}
        </p>
      </button>

      <section className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recently read</h2>
        </div>
        <div className="grid gap-2">
          {recent.length === 0 ? <p className="text-sm text-muted">No recent chapters yet.</p> : null}
          {recent.map((item) => (
            <Card
              key={`${item.bookId}-${item.chapter}-${item.openedAt}`}
              onClick={() => navigate(`/bible/${item.bookId}/${item.chapter}`)}
            >
              {formatReference(item.bookId, item.chapter, undefined, item.translationId === "bsi-ov" ? "ta" : "en")}
            </Card>
          ))}
        </div>
      </section>

      <Card className="mb-4" onClick={() => navigate("/sermons")}>
        <p className="text-xs tracking-[0.25em] text-gold uppercase">Sunday sermon</p>
        <h2 className="mt-2 font-semibold">Prepare this week&apos;s notes</h2>
        <p className="mt-1 text-sm text-muted">
          {sermonCount ? `${sermonCount} notebook${sermonCount === 1 ? "" : "s"} on this phone` : "Collect verses, write the outline, then share to Google Drive."}
        </p>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {[
          { label: "READ BIBLE", to: "/bible" },
          { label: "SEARCH", to: "/search" },
          { label: `BOOKMARKS (${bookmarkCount})`, to: "/bookmarks" },
          { label: `HIGHLIGHTS (${highlightCount})`, to: "/highlights" },
          { label: `NOTES (${noteCount})`, to: "/notes" },
          { label: `SERMONS (${sermonCount})`, to: "/sermons" },
          { label: "READING PLANS", to: "/reading-plans" },
        ].map((item) => (
          <Card key={item.to} onClick={() => navigate(item.to)}>
            <p className="text-sm font-semibold tracking-wide">{item.label}</p>
          </Card>
        ))}
      </div>
    </Page>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OfflineBadge } from "@/components/ui/OfflineBadge";
import { ModeToggle } from "@/components/bible/TranslationSelector";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/useToast";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { getDailyVersePair } from "@/services/dailyVerse";
import { listRecentHistory } from "@/services/historyService";
import { addBookmark } from "@/services/bookmarkService";
import { listPlans, planProgress } from "@/services/planService";
import { copyText, formatVerseShare, shareOrCopy } from "@/services/shareService";
import { formatReference } from "@/utils/reference";
import { cn } from "@/utils/misc";
import type { VerseRecord } from "@/types/bible";
import type { ReadingHistoryRecord } from "@/types/userData";
import { db } from "@/db";

export function HomePage() {
  const navigate = useNavigate();
  const { settings, update } = useSettings();
  const { push } = useToast();
  const { canInstall, install } = useInstallPrompt();
  const [pair, setPair] = useState<{ english?: VerseRecord; tamil?: VerseRecord }>({});
  const [recent, setRecent] = useState<ReadingHistoryRecord[]>([]);
  const [planInfo, setPlanInfo] = useState({ name: "Reading Plan", day: 1, total: 365, id: "njc-plan" });
  const bookmarkCount = useLiveQuery(() => db.bookmarks.count(), []) ?? 0;
  const noteCount = useLiveQuery(() => db.notes.count(), []) ?? 0;
  const highlightCount = useLiveQuery(() => db.highlights.count(), []) ?? 0;
  const bsi = useLiveQuery(() => db.translations.get("bsi-ov"));
  const verse = pair.english;

  useEffect(() => {
    void getDailyVersePair(settings.dailyVerseSalt).then(setPair);
    void listRecentHistory(5).then(setRecent);
    void (async () => {
      const plans = await listPlans();
      const plan = plans.find((item) => item.id === "njc-plan") ?? plans.find((item) => item.id === "bible-1-year") ?? plans[0];
      if (!plan) return;
      const progress = await planProgress(plan.id);
      setPlanInfo({ name: plan.name, day: progress.currentDay, total: progress.total, id: plan.id });
    })();
  }, [settings.dailyVerseSalt]);

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

      <Card className="mb-4 bg-navy text-white dark:bg-navy-soft">
        <p className="text-xs tracking-[0.25em] text-gold-soft uppercase">Continue Reading</p>
        <h2 className={cn("mt-2 text-2xl font-semibold", settings.defaultTranslation === "bsi-ov" && "tamil")}>
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
      </Card>

      <Card className="mb-4">
        <p className="text-xs tracking-[0.25em] text-gold uppercase">Today's Verse</p>
        {verse ? (
          <>
            {pair.tamil && !pair.tamil.isPlaceholder ? (
              <div className="mt-3">
                <p className="text-xs font-semibold text-muted uppercase">தமிழ்</p>
                <p className="tamil mt-1 text-lg leading-relaxed">{pair.tamil.text}</p>
              </div>
            ) : null}
            <div className="mt-3">
              <p className="text-xs font-semibold text-muted uppercase">English</p>
              <p className="english-serif mt-1 text-lg leading-relaxed">{verse.text}</p>
            </div>
            <p className="mt-3 text-sm font-semibold">
              {formatReference(verse.bookId, verse.chapter, verse.number)}
            </p>
          </>
        ) : (
          <p className="mt-2">Bible data is not installed yet.</p>
        )}
        {verse ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                void shareOrCopy(
                  "NJC Bible App",
                  formatVerseShare({
                    bookId: verse.bookId,
                    chapter: verse.chapter,
                    verse: verse.number,
                    text: verse.text,
                    language: "en",
                  }),
                )
              }
            >
              Share
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void addBookmark({
                  translationId: verse.translationId,
                  bookId: verse.bookId,
                  chapter: verse.chapter,
                  verseStart: verse.number,
                  verseEnd: verse.number,
                  title: "Favorites",
                  category: "Favorites",
                }).then(() => push("Bookmarked", "success"));
              }}
            >
              Bookmark
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                void copyText(
                  formatVerseShare({
                    bookId: verse.bookId,
                    chapter: verse.chapter,
                    verse: verse.number,
                    text: verse.text,
                    language: "en",
                  }),
                ).then(() => push("Copied", "success"))
              }
            >
              Copy
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                navigate("/verse-image", {
                  state: {
                    bookId: verse.bookId,
                    chapter: verse.chapter,
                    verse: verse.number,
                    text: verse.text,
                    language: "en",
                    translationId: verse.translationId,
                  },
                })
              }
            >
              Image
            </Button>
          </div>
        ) : null}
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {[
          { label: "READ BIBLE", to: "/bible" },
          { label: "SEARCH", to: "/search" },
          { label: `BOOKMARKS (${bookmarkCount})`, to: "/bookmarks" },
          { label: `HIGHLIGHTS (${highlightCount})`, to: "/highlights" },
          { label: `NOTES (${noteCount})`, to: "/notes" },
          { label: "READING PLANS", to: "/reading-plans" },
        ].map((item) => (
          <Card key={item.to} onClick={() => navigate(item.to)}>
            <p className="text-sm font-semibold tracking-wide">{item.label}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-4" onClick={() => navigate(`/reading-plans/${planInfo.id}`)}>
        <p className="text-xs tracking-[0.25em] text-gold uppercase">Reading Plan</p>
        <h3 className="mt-2 font-semibold">{planInfo.name}</h3>
        <p className="mt-1 text-sm text-muted">
          Day {planInfo.day} / {planInfo.total}
        </p>
      </Card>

      <section>
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
    </Page>
  );
}

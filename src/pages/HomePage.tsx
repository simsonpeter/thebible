import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OfflineBadge } from "@/components/ui/OfflineBadge";
import { useSettings } from "@/hooks/useSettings";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useToast } from "@/hooks/useToast";
import { listRecentHistory } from "@/services/historyService";
import { listPlans, planProgress } from "@/services/planService";
import { getDailyVersePair } from "@/services/dailyVerse";
import { formatReference } from "@/utils/reference";
import { formatVerseShare, shareOrCopy } from "@/services/shareService";
import { cn } from "@/utils/misc";
import { isTamilScript, translationUiLanguage } from "@/config/translations";
import type { ReadingHistoryRecord } from "@/types/userData";
import type { VerseRecord } from "@/types/bible";
import { db } from "@/db";

export function HomePage() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { canInstall, install } = useInstallPrompt();
  const { push } = useToast();
  const [recent, setRecent] = useState<ReadingHistoryRecord[]>([]);
  const [planInfo, setPlanInfo] = useState({ name: "Reading Plan", day: 1, total: 365, id: "njc-plan" });
  const [dailyTamil, setDailyTamil] = useState<VerseRecord | undefined>();
  const [dailyEnglish, setDailyEnglish] = useState<VerseRecord | undefined>();
  const bookmarkCount = useLiveQuery(() => db.bookmarks.count(), []) ?? 0;
  const noteCount = useLiveQuery(() => db.notes.count(), []) ?? 0;
  const sermonCount = useLiveQuery(() => db.sermons.count(), []) ?? 0;
  const highlightCount = useLiveQuery(() => db.highlights.count(), []) ?? 0;
  const bsi = useLiveQuery(() => db.translations.get("bsi-ov"));

  useEffect(() => {
    void listRecentHistory(12).then(setRecent);
    void (async () => {
      const plans = await listPlans();
      const plan = plans.find((item) => item.id === "njc-plan") ?? plans.find((item) => item.id === "bible-1-year") ?? plans[0];
      if (!plan) return;
      const progress = await planProgress(plan.id);
      setPlanInfo({ name: plan.name, day: progress.currentDay, total: progress.total, id: plan.id });
    })();
    void getDailyVersePair(settings.dailyVerseSalt).then((pair) => {
      setDailyEnglish(pair.english);
      setDailyTamil(pair.tamil);
    });
  }, [settings.dailyVerseSalt]);

  const continueBook = recent[0]?.bookId ?? settings.lastBookId;
  const continueChapter = recent[0]?.chapter ?? settings.lastChapter;
  const continueVerse = settings.lastVerse;
  const bsiReady = Boolean(bsi && !bsi.isDemo && bsi.verseCount > 0);
  const recentStrip = recent.slice(1);
  const daily = dailyTamil ?? dailyEnglish;
  const dailyLanguage = dailyTamil ? ("ta" as const) : ("en" as const);

  async function shareDaily() {
    if (!daily) return;
    const text = formatVerseShare({
      bookId: daily.bookId,
      chapter: daily.chapter,
      verse: daily.number,
      text: daily.text,
      language: dailyLanguage,
    });
    const result = await shareOrCopy("NJC Bible App — Verse of the day", text);
    if (result === "copied") push("Verse copied", "success");
  }

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

      {!bsiReady ? (
        <p className="mb-4 rounded-2xl bg-gold-soft/50 px-4 py-3 text-sm text-navy-deep">
          Tamil Bible data has not been installed yet. It is bundled as Tamil O.V. and will load on first launch, or you
          can import book JSON files from Settings → Bible Data.
        </p>
      ) : null}

      <section className="mb-4 rounded-3xl bg-[#12263A] p-5 text-white dark:bg-[#1d3b5a]">
        <p className="text-xs tracking-[0.25em] text-[#e8d5a3] uppercase">Continue Reading</p>
        <h2 className={cn("mt-2 text-2xl font-semibold text-white", isTamilScript(settings.defaultTranslation) && "tamil")}>
          {formatReference(continueBook, continueChapter, continueVerse || undefined, translationUiLanguage(settings.defaultTranslation))}
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

      {daily ? (
        <section className="mb-4 rounded-3xl border border-navy/10 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs tracking-[0.25em] text-gold uppercase">Verse of the day</p>
          <p className="mt-2 text-sm font-semibold text-muted">
            {formatReference(daily.bookId, daily.chapter, daily.number, dailyLanguage)}
          </p>
          {dailyTamil ? <p className="tamil mt-3 text-base leading-relaxed">{dailyTamil.text}</p> : null}
          {dailyEnglish ? (
            <p className={cn("mt-2 text-sm leading-relaxed text-muted", !dailyTamil && "text-base text-navy dark:text-paper")}>
              {dailyEnglish.text}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="gold"
              onClick={() =>
                navigate(
                  `/bible/${daily.bookId}/${daily.chapter}?verse=${daily.number}&translation=${dailyTamil ? "bsi-ov" : "kjv"}`,
                )
              }
            >
              Read chapter
            </Button>
            <Button variant="secondary" onClick={() => void shareDaily()}>
              Share
            </Button>
          </div>
        </section>
      ) : null}

      {recentStrip.length > 0 ? (
        <section className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent chapters</h2>
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {recentStrip.map((item) => (
              <button
                key={`${item.bookId}-${item.chapter}-${item.openedAt}`}
                type="button"
                className="min-h-11 shrink-0 rounded-full bg-paper-2 px-4 text-sm font-semibold whitespace-nowrap dark:bg-white/5"
                onClick={() =>
                  navigate(`/bible/${item.bookId}/${item.chapter}?translation=${item.translationId || settings.defaultTranslation}`)
                }
              >
                {formatReference(item.bookId, item.chapter, undefined, translationUiLanguage(item.translationId))}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <Card className="mb-4" onClick={() => navigate(`/reading-plans/${planInfo.id}`)}>
        <p className="text-xs tracking-[0.25em] text-gold uppercase">Reading Plan</p>
        <h3 className="mt-2 font-semibold">{planInfo.name}</h3>
        <p className="mt-1 text-sm text-muted">
          Day {planInfo.day} / {planInfo.total}
        </p>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {(
          [
            { label: "READ BIBLE", to: "/bible" },
            { label: "SEARCH", to: "/search" },
            { label: "Strong Dictionary", subtitle: "Hebrew/Greek", to: "/dictionary" },
            { label: "Commentary", subtitle: "Brief + full Tamil விரிவுரை", to: "/commentary" },
            { label: `BOOKMARKS (${bookmarkCount})`, to: "/bookmarks" },
            { label: `HIGHLIGHTS (${highlightCount})`, to: "/highlights" },
            { label: `NOTES (${noteCount})`, to: "/notes" },
            { label: `SERMONS (${sermonCount})`, to: "/sermons" },
            { label: "READING PLANS", to: "/reading-plans" },
          ] as Array<{ label: string; to: string; subtitle?: string }>
        ).map((item) => (
          <Card key={item.to} onClick={() => navigate(item.to)}>
            <p className="text-sm font-semibold tracking-wide">{item.label}</p>
            {item.subtitle ? <p className="mt-1 text-xs text-muted">{item.subtitle}</p> : null}
          </Card>
        ))}
      </div>

      <Card className="mb-4" onClick={() => navigate("/notes")}>
        <p className="text-xs tracking-[0.25em] text-gold uppercase">Notes</p>
        <h2 className="mt-2 font-semibold">Your personal notes</h2>
        <p className="mt-1 text-sm text-muted">
          {noteCount ? `${noteCount} note${noteCount === 1 ? "" : "s"} on this phone` : "Verse notes you write while reading."}
        </p>
      </Card>
    </Page>
  );
}

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
import { getReadingStreak, listFinishedBooks } from "@/services/streakService";
import { formatReference } from "@/utils/reference";
import { formatVerseShare, shareOrCopy } from "@/services/shareService";
import { shareVerseImage } from "@/services/verseImage";
import { getChapterVerses } from "@/services/bibleService";
import { cn } from "@/utils/misc";
import { isTamilScript, translationUiLanguage } from "@/config/translations";
import type { ReadingHistoryRecord } from "@/types/userData";
import type { VerseRecord } from "@/types/bible";
import { db } from "@/db";

export function HomePage() {
  const navigate = useNavigate();
  const { settings, update } = useSettings();
  const { canInstall, install } = useInstallPrompt();
  const { push } = useToast();
  const [recent, setRecent] = useState<ReadingHistoryRecord[]>([]);
  const [planInfo, setPlanInfo] = useState({ name: "Reading Plan", day: 1, total: 365, id: "njc-plan", behind: 0 });
  const [dailyTamil, setDailyTamil] = useState<VerseRecord | undefined>();
  const [dailyEnglish, setDailyEnglish] = useState<VerseRecord | undefined>();
  const [kidsText, setKidsText] = useState("");
  const [sharing, setSharing] = useState(false);
  const [streak, setStreak] = useState({ current: 0, readToday: false });
  const bookmarkCount = useLiveQuery(() => db.bookmarks.count(), []) ?? 0;
  const noteCount = useLiveQuery(() => db.notes.count(), []) ?? 0;
  const sermonCount = useLiveQuery(() => db.sermons.count(), []) ?? 0;
  const highlightCount = useLiveQuery(() => db.highlights.count(), []) ?? 0;
  const bsi = useLiveQuery(() => db.translations.get("bsi-ov"));

  useEffect(() => {
    void listRecentHistory(12).then(setRecent);
    void getReadingStreak().then(setStreak);
    void (async () => {
      const plans = await listPlans();
      const plan = plans.find((item) => item.id === "njc-plan") ?? plans.find((item) => item.id === "bible-1-year") ?? plans[0];
      if (!plan) return;
      const progress = await planProgress(plan.id);
      const dayOfYear = Math.min(
        plan.totalDays,
        Math.max(1, Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000)),
      );
      const behind = Math.max(0, dayOfYear - progress.currentDay);
      setPlanInfo({ name: plan.name, day: progress.currentDay, total: progress.total, id: plan.id, behind });
    })();
    void getDailyVersePair(settings.dailyVerseSalt).then(async (pair) => {
      setDailyEnglish(pair.english);
      setDailyTamil(pair.tamil);
      if (pair.english && settings.showKidsPromise) {
        const tanglish = await getChapterVerses("tanglish", pair.english.bookId, pair.english.chapter);
        const hit = tanglish.find((verse) => verse.number === pair.english!.number);
        setKidsText(hit && !hit.isPlaceholder ? hit.text : "");
      } else {
        setKidsText("");
      }
    });
    void listFinishedBooks().then((finished) => {
      const remembered = settings.rememberedFinishedBooks;
      const fresh = finished.filter((id) => !remembered.includes(id));
      if (!fresh.length) return;
      push(`Finished ${fresh[0]!.replace(/-/g, " ")} — well done!`, "success");
      void update({ rememberedFinishedBooks: [...remembered, ...fresh] });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- celebrate newly finished books once per load
  }, [settings.dailyVerseSalt, settings.showKidsPromise]);

  const continueBook = recent[0]?.bookId ?? settings.lastBookId;
  const continueChapter = recent[0]?.chapter ?? settings.lastChapter;
  const continueVerse = settings.lastVerse;
  const bsiReady = Boolean(bsi && !bsi.isDemo && bsi.verseCount > 0);
  const recentStrip = recent.slice(1);
  const daily = dailyTamil ?? dailyEnglish;
  const dailyLanguage = dailyTamil ? ("ta" as const) : ("en" as const);
  const sunday = settings.sundayPin;

  async function shareDaily() {
    if (!daily) return;
    const text = dailyTamil?.text ?? dailyEnglish?.text ?? daily.text;
    const language = dailyTamil ? ("ta" as const) : ("en" as const);
    setSharing(true);
    try {
      const result = await shareVerseImage({
        template: "promise",
        bookId: daily.bookId,
        chapter: daily.chapter,
        verse: daily.number,
        text,
        language,
        fontSize: language === "ta" ? 40 : 46,
        align: "center",
        eyebrow: "Promise of the day",
      });
      if (result === "downloaded") push("Image saved — open it to share", "success");
      else if (result === "shared") push("Promise shared", "success");
    } catch {
      const fallback = formatVerseShare({
        bookId: daily.bookId,
        chapter: daily.chapter,
        verse: daily.number,
        text,
        language,
      });
      const result = await shareOrCopy("NJC Bible App — Promise of the day", fallback);
      if (result === "copied") push("Verse copied", "success");
    } finally {
      setSharing(false);
    }
  }

  function openPromiseImage() {
    if (!daily) return;
    navigate("/verse-image", {
      state: {
        bookId: daily.bookId,
        chapter: daily.chapter,
        verse: daily.number,
        text: dailyTamil?.text ?? dailyEnglish?.text ?? daily.text,
        language: dailyLanguage,
        template: "promise",
        eyebrow: "Promise of the day",
      },
    });
  }

  return (
    <Page title="NJC Bible App" subtitle="தமிழ் வேதாகமம் • English Bible" showStatus>
      <div className="mb-5 flex items-center justify-between gap-3">
        <OfflineBadge />
        <div className="flex flex-wrap items-center gap-2">
          {streak.current > 0 ? (
            <span className="rounded-full bg-gold-soft/70 px-3 py-1 text-xs font-semibold text-navy-deep">
              {streak.current}-day streak{streak.readToday ? "" : " · keep going"}
            </span>
          ) : null}
          {canInstall ? (
            <Button variant="gold" onClick={() => void install()}>
              Install
            </Button>
          ) : null}
        </div>
      </div>

      {!bsiReady ? (
        <p className="mb-4 rounded-2xl bg-gold-soft/50 px-4 py-3 text-sm text-navy-deep">
          Tamil Bible data has not been installed yet. It is bundled as Tamil O.V. and will load on first launch, or you
          can import book JSON files from Settings → Bible Data.
        </p>
      ) : null}

      {sunday ? (
        <section className="mb-4 rounded-3xl border border-gold/40 bg-gold-soft/30 p-5 dark:bg-gold/10">
          <p className="text-xs tracking-[0.25em] text-gold uppercase">{sunday.label || "This Sunday"}</p>
          <h2 className="mt-2 text-xl font-semibold">
            {formatReference(sunday.bookId, sunday.chapter, sunday.verse, translationUiLanguage(settings.defaultTranslation))}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="gold"
              onClick={() =>
                navigate(
                  `/bible/${sunday.bookId}/${sunday.chapter}?translation=${settings.defaultTranslation}${sunday.verse ? `&verse=${sunday.verse}` : ""}`,
                )
              }
            >
              Open passage
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                navigate(`/bible/${sunday.bookId}/${sunday.chapter}?mode=parallel&translation=bsi-ov`)
              }
            >
              3-way teach
            </Button>
            <Button variant="ghost" onClick={() => navigate(`/commentary/full/${sunday.bookId}/${sunday.chapter}`)}>
              Commentary
            </Button>
          </div>
        </section>
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
          <p className="text-xs tracking-[0.25em] text-gold uppercase">Promise of the day</p>
          <p className="mt-2 text-sm font-semibold text-muted">
            {formatReference(daily.bookId, daily.chapter, daily.number, dailyLanguage)}
          </p>
          {dailyTamil ? <p className="tamil mt-3 text-base leading-relaxed">{dailyTamil.text}</p> : null}
          {dailyEnglish ? (
            <p className={cn("mt-2 text-sm leading-relaxed text-muted", !dailyTamil && "text-base text-navy dark:text-paper")}>
              {dailyEnglish.text}
            </p>
          ) : null}
          {settings.showKidsPromise && kidsText ? (
            <div className="mt-3 rounded-2xl bg-paper-2 p-3 dark:bg-white/5">
              <p className="text-xs font-semibold tracking-wide text-gold uppercase">Kids · Tanglish</p>
              <p className="mt-1 text-sm leading-relaxed">{kidsText}</p>
            </div>
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
            <Button variant="secondary" disabled={sharing} onClick={() => void shareDaily()}>
              {sharing ? "Preparing…" : "Share image"}
            </Button>
            <Button variant="ghost" onClick={openPromiseImage}>
              Edit image
            </Button>
          </div>
        </section>
      ) : null}

      {planInfo.behind > 0 ? (
        <Card className="mb-4" onClick={() => navigate(`/reading-plans/${planInfo.id}`)}>
          <p className="text-xs tracking-[0.25em] text-gold uppercase">Catch up</p>
          <p className="mt-2 font-semibold">
            You’re about {planInfo.behind} day{planInfo.behind === 1 ? "" : "s"} behind on {planInfo.name}
          </p>
          <p className="mt-1 text-sm text-muted">Open the plan and hear today’s chapter.</p>
        </Card>
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
            { label: "Topics", subtitle: "Faith · Prayer · Peace", to: "/topics" },
            { label: "Memory", subtitle: "Practice cards", to: "/memory" },
            { label: "Strong Dictionary", subtitle: "Hebrew/Greek", to: "/dictionary" },
            { label: "Commentary", subtitle: "Brief + full Tamil விரிவுரை", to: "/commentary" },
            { label: `BOOKMARKS (${bookmarkCount})`, to: "/bookmarks" },
            { label: `HIGHLIGHTS (${highlightCount})`, to: "/highlights" },
            { label: `NOTES (${noteCount})`, to: "/notes" },
            { label: `SERMONS (${sermonCount})`, to: "/sermons" },
            { label: "READING PLANS", to: "/reading-plans" },
            { label: "PROGRESS", to: "/progress" },
          ] as Array<{ label: string; to: string; subtitle?: string }>
        ).map((item) => (
          <Card key={item.to} onClick={() => navigate(item.to)}>
            <p className="text-sm font-semibold tracking-wide">{item.label}</p>
            {item.subtitle ? <p className="mt-1 text-xs text-muted">{item.subtitle}</p> : null}
          </Card>
        ))}
      </div>
    </Page>
  );
}

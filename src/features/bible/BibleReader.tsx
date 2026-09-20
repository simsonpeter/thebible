import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { getBookById } from "@/data/books";
import { DEMO_BANNER } from "@/data/licenses";
import { BookSelector } from "@/components/bible/BookSelector";
import { ChapterSelector } from "@/components/bible/ChapterSelector";
import { BibleNavigator } from "@/components/bible/BibleNavigator";
import { ModeToggle, TranslationLanguagePicker, TranslationSelector } from "@/components/bible/TranslationSelector";
import { ParallelVerseRow } from "@/components/bible/ParallelVerseRow";
import { VerseContextMenu } from "@/components/bible/VerseContextMenu";
import { VerseRow } from "@/components/bible/VerseRow";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { db } from "@/db";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/useToast";
import { useWakeLock } from "@/hooks/useWakeLock";
import { isTamilScript, toggleParallelTranslation, translationUiLanguage } from "@/config/translations";
import {
  adjacentChapter,
  getChapterVerses,
  getParallelVerses,
  getTranslation,
  listParallelTranslationIds,
  type ParallelVerse,
} from "@/services/bibleService";
import { addBookmark } from "@/services/bookmarkService";
import { getHighlightMap, removeHighlight, setHighlight } from "@/services/highlightService";
import { recordChapterOpen } from "@/services/historyService";
import { addNote } from "@/services/noteService";
import { addSermonPassageRange, createSermon, readActiveSermonId, rememberActiveSermon } from "@/services/sermonService";
import { markChapterRead } from "@/services/progressService";
import { copyText, formatParallelRangeShare, formatVersesShare, shareOrCopy } from "@/services/shareService";
import type { VerseRecord } from "@/types/bible";
import type { HighlightColor } from "@/types/userData";
import { DEFAULT_BOOKMARK_CATEGORIES } from "@/types/userData";
import { FONT_PRESETS, type FontPreset } from "@/types/settings";
import { formatRange } from "@/utils/reference";
import { verseId } from "@/utils/text";
import { cn, formatSundayLabel } from "@/utils/misc";

const FONT_ORDER: FontPreset[] = ["small", "medium", "large", "xl"];

export function BibleReader() {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings, update } = useSettings();
  const { push } = useToast();
  const bookId = params.book ?? settings.lastBookId;
  const chapter = Number(params.chapter ?? settings.lastChapter);
  const verseParam = Number(searchParams.get("verse") ?? 0);
  const translationId = searchParams.get("translation") ?? settings.defaultTranslation;
  const mode = (searchParams.get("mode") as "single" | "parallel" | null) ?? settings.readingMode;
  const book = getBookById(bookId);
  const [verses, setVerses] = useState<VerseRecord[]>([]);
  const [pairs, setPairs] = useState<ParallelVerse[]>([]);
  const [parallelIds, setParallelIds] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<Map<string, { color: HighlightColor }>>(new Map());
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(
    verseParam ? { start: verseParam, end: verseParam } : null,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [goOpen, setGoOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState("Favorites");
  const [bookmarkCategory, setBookmarkCategory] = useState("Favorites");
  const [sermonOpen, setSermonOpen] = useState(false);
  const [newSermonTitle, setNewSermonTitle] = useState("");
  const sermons = useLiveQuery(() => db.sermons.orderBy("updatedAt").reverse().toArray(), []) ?? [];
  const [missing, setMissing] = useState(false);
  const [demo, setDemo] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [layout, setLayout] = useState<"stacked" | "columns">("stacked");

  useWakeLock(settings.wakeLock);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const apply = () => setLayout(media.matches ? "columns" : "stacked");
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!book || !Number.isInteger(chapter) || chapter < 1) {
      navigate("/bible/john/3", { replace: true });
    }
  }, [book, chapter, navigate]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const translation = await getTranslation(translationId);
      if (!translation) {
        if (!cancelled) {
          setMissing(true);
          setLoaded(true);
        }
        return;
      }
      setDemo(Boolean(translation.isDemo));
      setMissing(false);
      setLoaded(false);
      if (mode === "parallel") {
        const ids = await listParallelTranslationIds(settings.parallelOrder, settings.parallelTranslations);
        const nextPairs = await getParallelVerses(bookId, chapter, ids);
        if (!cancelled) {
          setParallelIds(ids);
          setPairs(nextPairs);
          setLoaded(true);
        }
      } else {
        const next = await getChapterVerses(translationId, bookId, chapter);
        if (!cancelled) {
          setVerses(next);
          setLoaded(true);
        }
      }
      const map = await getHighlightMap(translationId, bookId, chapter);
      if (!cancelled) setHighlights(map);
      await recordChapterOpen(translationId, bookId, chapter);
      window.setTimeout(() => {
        void markChapterRead(bookId, chapter);
      }, 3000);
      if (settings.rememberPosition) {
        await update({ lastBookId: bookId, lastChapter: chapter, lastVerse: verseParam || 1 });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [
    bookId,
    chapter,
    translationId,
    mode,
    verseParam,
    settings.parallelOrder,
    settings.parallelTranslations,
    settings.rememberPosition,
    update,
  ]);

  useEffect(() => {
    if (!verseParam) return;
    const node = document.getElementById(`v-${verseParam}`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
    setSelection({ start: verseParam, end: verseParam });
  }, [verseParam, verses, pairs]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        const next = adjacentChapter(bookId, chapter, -1);
        if (next) navigate(buildPath(next.bookId, next.chapter));
      }
      if (event.key === "ArrowRight") {
        const next = adjacentChapter(bookId, chapter, 1);
        if (next) navigate(buildPath(next.bookId, next.chapter));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bookId, chapter, navigate, searchParams, translationId, mode]);

  const range = useMemo(() => {
    if (!selection) return null;
    return {
      start: Math.min(selection.start, selection.end),
      end: Math.max(selection.start, selection.end),
    };
  }, [selection]);

  const selectedCount = range ? range.end - range.start + 1 : 0;

  const chapterVerseNumbers = useMemo(
    () => (mode === "parallel" ? pairs.map((item) => item.number) : verses.map((item) => item.number)),
    [mode, pairs, verses],
  );

  const selectedVerse = useMemo(() => {
    if (!range) return undefined;
    if (mode === "parallel") {
      const pair = pairs.find((item) => item.number === range.start);
      for (const id of parallelIds) {
        const verse = pair?.byId[id];
        if (verse && !verse.isPlaceholder) return verse;
      }
      return parallelIds.map((id) => pair?.byId[id]).find(Boolean);
    }
    return verses.find((item) => item.number === range.start);
  }, [range, mode, pairs, verses, parallelIds]);

  const selectedSingleVerses = useMemo(() => {
    if (!range) return [];
    return verses.filter((item) => item.number >= range.start && item.number <= range.end && !item.isPlaceholder);
  }, [range, verses]);

  const selectedPairs = useMemo(() => {
    if (!range) return [];
    return pairs.filter((item) => item.number >= range.start && item.number <= range.end);
  }, [range, pairs]);

  function goChapter(delta: number) {
    const next = adjacentChapter(bookId, chapter, delta);
    if (!next) return;
    navigate(buildPath(next.bookId, next.chapter));
  }

  function buildPath(nextBook: string, nextChapter: number, extra?: Record<string, string>) {
    const paramsObj = new URLSearchParams(searchParams);
    paramsObj.set("translation", translationId);
    paramsObj.set("mode", mode);
    if (extra) {
      for (const [key, value] of Object.entries(extra)) paramsObj.set(key, value);
    }
    return `/bible/${nextBook}/${nextChapter}?${paramsObj.toString()}`;
  }

  function changeBook(nextBook: string) {
    setSelection(null);
    navigate(buildPath(nextBook, 1));
  }

  function changeChapter(nextChapter: number) {
    setSelection(null);
    navigate(buildPath(bookId, nextChapter));
  }

  function changeTranslation(id: string) {
    const paramsObj = new URLSearchParams(searchParams);
    paramsObj.set("translation", id);
    setSearchParams(paramsObj);
    void update({ defaultTranslation: id as typeof settings.defaultTranslation });
  }

  function toggleCompare(id: string) {
    const next = toggleParallelTranslation(settings.parallelTranslations, id);
    if (next.length === settings.parallelTranslations.length && next.every((item, index) => item === settings.parallelTranslations[index])) {
      push("Keep at least two Bibles in parallel", "info");
      return;
    }
    void update({ parallelTranslations: next });
  }

  function changeMode(next: "single" | "parallel") {
    const paramsObj = new URLSearchParams(searchParams);
    paramsObj.set("translation", translationId);
    paramsObj.set("mode", next);
    setSearchParams(paramsObj);
    void update({ readingMode: next });
  }

  function bumpFont(delta: number) {
    const index = Math.max(0, Math.min(FONT_ORDER.length - 1, FONT_ORDER.indexOf(settings.fontPreset) + delta));
    const preset = FONT_ORDER[index];
    void update({ fontPreset: preset, ...FONT_PRESETS[preset] });
  }

  function selectVerse(number: number) {
    setSelection((current) => {
      if (!current) return { start: number, end: number };
      if (current.start === current.end && current.start === number) return current;
      return { start: current.start, end: number };
    });
  }

  function selectChapter() {
    const first = chapterVerseNumbers[0];
    const last = chapterVerseNumbers[chapterVerseNumbers.length - 1];
    if (first == null || last == null) return;
    setSelection({ start: first, end: last });
  }

  function openMenu(number: number) {
    setSelection((current) => {
      if (!current) return { start: number, end: number };
      return { start: current.start, end: number };
    });
    setMenuOpen(true);
  }

  function selectionReference() {
    if (!range) return "";
    return formatRange(bookId, chapter, range.start, range.end, language);
  }

  function selectedShareText() {
    if (!range) return "";
    if (mode === "parallel") {
      return formatParallelRangeShare({
        bookId,
        chapter,
        rows: selectedPairs.map((pair) => ({
          number: pair.number,
          columns: parallelIds.map((id) => ({
            id,
            text: pair.byId[id]?.isPlaceholder ? undefined : pair.byId[id]?.text,
          })),
        })),
      });
    }
    return formatVersesShare({
      bookId,
      chapter,
      verses: selectedSingleVerses.map((verse) => ({ number: verse.number, text: verse.text })),
      language,
    });
  }

  async function onHighlight(color: HighlightColor) {
    if (!range) return;
    const next = new Map(highlights);
    for (let number = range.start; number <= range.end; number += 1) {
      const id = verseId(translationId, bookId, chapter, number);
      await setHighlight({
        verseId: id,
        translationId,
        bookId,
        chapter,
        verseNumber: number,
        color,
      });
      next.set(id, { color });
    }
    setHighlights(next);
    setMenuOpen(false);
    push(selectedCount > 1 ? "Verses highlighted" : "Verse highlighted", "success");
  }

  async function handleAction(action: string) {
    if (!range) return;
    const verse = selectedVerse;
    const text = verse?.text ?? "";
    const verseLanguage = translationUiLanguage(verse?.translationId ?? translationId);
    const shareText = selectedShareText();
    if (action === "copy") {
      await copyText(shareText);
      push(selectedCount > 1 ? "Verses copied" : "Copied", "success");
    }
    if (action === "share") {
      const result = await shareOrCopy("NJC Bible App", shareText);
      if (result === "copied") push(selectedCount > 1 ? "Verses copied" : "Copied", "success");
    }
    if (action === "bookmark") setBookmarkOpen(true);
    if (action === "note") setNoteOpen(true);
    if (action === "sermon") setSermonOpen(true);
    if (action === "compare") changeMode("parallel");
    if (action === "search") navigate(`/search?q=${encodeURIComponent(text.slice(0, 40))}`);
    if (action === "strongs") navigate("/dictionary");
    if (action === "commentary") navigate(`/commentary/full/${bookId}/${chapter}`);
    if (action === "image") {
      navigate("/verse-image", {
        state: { bookId, chapter, verse: range.start, text, language: verseLanguage, translationId },
      });
    }
    setMenuOpen(false);
  }

  function versesForSermon(): VerseRecord[][] {
    if (!range) return [];
    if (mode === "parallel") {
      return parallelIds
        .map((id) =>
          selectedPairs
            .map((pair) => pair.byId[id])
            .filter((item): item is VerseRecord => Boolean(item && !item.isPlaceholder)),
        )
        .filter((group) => group.length > 0);
    }
    return selectedSingleVerses.length ? [selectedSingleVerses] : [];
  }

  async function addVersesToSermon(sermonId: number) {
    const groups = versesForSermon();
    const total = groups.reduce((sum, group) => sum + group.length, 0);
    if (!total) {
      push("Select a verse first", "error");
      return;
    }
    for (const group of groups) {
      await addSermonPassageRange(sermonId, group);
    }
    rememberActiveSermon(sermonId);
    setSermonOpen(false);
    setNewSermonTitle("");
    push(total > 1 ? `${total} verses added to sermon` : "Verse added to sermon", "success");
  }

  const language = translationUiLanguage(
    mode === "parallel" ? (parallelIds.find((id) => isTamilScript(id)) ?? parallelIds[0] ?? translationId) : translationId,
  );
  const empty =
    loaded &&
    (mode === "single"
      ? verses.length === 0
      : pairs.every((pair) => parallelIds.every((id) => !pair.byId[id])));

  return (
    <div className={cn("safe-bottom min-h-screen", range && "pb-44", settings.distractionFree && "bg-paper dark:bg-[#090c10]")}>
      {settings.distractionFree ? (
        <div className="sticky top-0 z-20 flex justify-end p-3">
          <Button variant="ghost" onClick={() => void update({ distractionFree: false })}>
            Exit focus
          </Button>
        </div>
      ) : (
        <header className="sticky top-0 z-20 border-b border-navy/8 bg-paper/95 px-3 py-2 backdrop-blur dark:border-white/10 dark:bg-[#0c1016]/95">
          <div className="mb-2 flex items-center gap-1.5">
            <button type="button" className="min-h-10 min-w-10 text-xl" aria-label="Back" onClick={() => navigate(-1)}>
              ←
            </button>
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-sm font-semibold", language === "ta" && "tamil")}>
                {language === "ta" ? book?.nameTamil : book?.nameEnglish} {chapter}
              </p>
            </div>
            <button type="button" className="min-h-10 min-w-10 text-xl" aria-label="Search" onClick={() => navigate("/search")}>
              ⌕
            </button>
            <button type="button" className="min-h-10 min-w-10 text-xl" aria-label="Go to verse" onClick={() => setGoOpen(true)}>
              ⋮
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {mode === "parallel" ? (
              <div className="w-full">
                <TranslationLanguagePicker
                  compact
                  selected={settings.parallelTranslations}
                  onSelect={toggleCompare}
                  order={settings.parallelOrder}
                />
              </div>
            ) : (
              <TranslationSelector value={translationId} onChange={changeTranslation} />
            )}
            <BookSelector value={bookId} language={language} onChange={changeBook} />
            <ChapterSelector bookId={bookId} value={chapter} language={language} onChange={changeChapter} />
            <ModeToggle value={mode} onChange={changeMode} />
            <div className="inline-flex rounded-full bg-navy/8 p-0.5 dark:bg-white/10" role="group" aria-label="Font size">
              <button type="button" className="min-h-9 min-w-9 text-xs" aria-label="Decrease font size" onClick={() => bumpFont(-1)}>
                A-
              </button>
              <button
                type="button"
                className="min-h-9 min-w-9 text-xs"
                aria-label="Medium font size"
                onClick={() => void update({ fontPreset: "medium", ...FONT_PRESETS.medium })}
              >
                A
              </button>
              <button type="button" className="min-h-9 min-w-9 text-xs" aria-label="Increase font size" onClick={() => bumpFont(1)}>
                A+
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto max-w-3xl px-4 py-3">
        {demo && translationId === "bsi-ov" ? (
          <p className="mb-3 rounded-2xl bg-gold-soft/60 px-4 py-3 text-sm text-navy-deep">
            {DEMO_BANNER}. Tamil Scripture is not included in this demo set. Placeholder verses are not Scripture.
          </p>
        ) : null}
        {missing || empty ? (
          <div className="rounded-3xl bg-white/80 p-6 dark:bg-white/5">
            {translationId === "bsi-ov" ? (
              <>
                <p className="font-semibold">Tamil Bible data has not been installed.</p>
                <p className="mt-2 text-sm text-muted">
                  Tamil O.V. is bundled with the app. If it did not load, import the 66 book JSON files from Settings →
                  Bible Data.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">No Bible data installed.</p>
                <p className="mt-2 text-sm text-muted">Unable to load this chapter.</p>
              </>
            )}
            <Button className="mt-4" onClick={() => navigate("/import")}>
              Import Bible data
            </Button>
          </div>
        ) : null}

        {range ? (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className={cn("text-sm font-semibold", language === "ta" && "tamil")}>{selectionReference()}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={selectChapter} disabled={!chapterVerseNumbers.length}>
                Whole chapter
              </Button>
              <Button variant="ghost" onClick={() => setSelection(null)}>
                Clear
              </Button>
            </div>
          </div>
        ) : null}

        {mode === "single"
          ? verses.map((verse) => (
              <VerseRow
                key={verse.id}
                verse={verse}
                showNumber={settings.showVerseNumbers}
                language={language}
                highlight={highlights.get(verse.id)?.color}
                selected={Boolean(range && verse.number >= range.start && verse.number <= range.end)}
                continuous={!settings.verseByVerse}
                serif={language === "ta" ? settings.tamilFont === "serif" : settings.englishFont === "serif"}
                onActivate={() => selectVerse(verse.number)}
                onLongPress={() => openMenu(verse.number)}
              />
            ))
          : pairs.map((pair) => (
              <ParallelVerseRow
                key={pair.number}
                number={pair.number}
                byId={pair.byId}
                translationIds={parallelIds}
                layout={layout}
                showNumber={settings.showVerseNumbers}
                selected={Boolean(range && pair.number >= range.start && pair.number <= range.end)}
                onActivate={() => selectVerse(pair.number)}
                onLongPress={() => openMenu(pair.number)}
              />
            ))}
      </main>

      {!settings.distractionFree ? (
        <div className="mx-auto flex max-w-3xl justify-between gap-3 px-4 pb-8">
          <Button variant="secondary" className="flex-1" onClick={() => goChapter(-1)}>
            ‹ Previous
          </Button>
          <Button className="flex-1" onClick={() => goChapter(1)}>
            Next ›
          </Button>
        </div>
      ) : null}

      {range ? (
        <div className="fixed inset-x-0 z-30 mx-auto max-w-3xl px-3 md:bottom-4 bottom-[calc(3.5rem+env(safe-area-inset-bottom))]">
          <div className="rounded-3xl border border-navy/10 bg-paper/95 p-3 shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#0c1016]/95">
            <p className={cn("mb-2 text-sm font-semibold", language === "ta" && "tamil")}>
              {selectionReference()}
              <span className="ml-2 font-normal text-muted">
                {selectedCount} verse{selectedCount === 1 ? "" : "s"}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => void handleAction("copy")}>
                Copy
              </Button>
              <Button variant="secondary" onClick={() => void handleAction("share")}>
                Share
              </Button>
              <Button variant="gold" onClick={() => void handleAction("sermon")}>
                Add to sermon
              </Button>
              <Button variant="ghost" onClick={() => setMenuOpen(true)}>
                More
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <VerseContextMenu
        open={menuOpen}
        reference={range ? selectionReference() : ""}
        onClose={() => setMenuOpen(false)}
        onAction={(action) => void handleAction(action)}
        onHighlight={(color) => void onHighlight(color)}
      />
      <BibleNavigator open={goOpen} onClose={() => setGoOpen(false)} />
      <Modal open={noteOpen} title="Add note" onClose={() => setNoteOpen(false)}>
        <textarea
          className="min-h-32 w-full rounded-2xl border border-navy/10 p-3 dark:border-white/10 dark:bg-white/5"
          value={noteText}
          onChange={(event) => setNoteText(event.target.value)}
        />
        <Button
          className="mt-3 w-full"
          onClick={() => {
            if (!range || !noteText.trim()) return;
            void addNote({
              translationId,
              bookId,
              chapter,
              verseNumber: range.start,
              verseId: verseId(translationId, bookId, chapter, range.start),
              text: noteText.trim(),
            }).then(() => {
              setNoteOpen(false);
              setNoteText("");
              push("Note saved", "success");
            });
          }}
        >
          Save note
        </Button>
      </Modal>
      <Modal open={bookmarkOpen} title="Bookmark" onClose={() => setBookmarkOpen(false)}>
        <input
          className="min-h-12 w-full rounded-2xl border border-navy/10 px-3 dark:border-white/10 dark:bg-white/5"
          value={bookmarkTitle}
          onChange={(event) => setBookmarkTitle(event.target.value)}
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {DEFAULT_BOOKMARK_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`min-h-11 rounded-2xl text-sm ${bookmarkCategory === category ? "bg-navy text-white" : "bg-paper-2 dark:bg-white/5"}`}
              onClick={() => {
                setBookmarkCategory(category);
                setBookmarkTitle(category);
              }}
            >
              {category}
            </button>
          ))}
        </div>
        <Button
          className="mt-4 w-full"
          onClick={() => {
            if (!range) return;
            void addBookmark({
              translationId,
              bookId,
              chapter,
              verseStart: range.start,
              verseEnd: range.end,
              title: bookmarkTitle,
              category: bookmarkCategory || bookmarkTitle || "Favorites",
            }).then(() => {
              setBookmarkOpen(false);
              push("Bookmarked", "success");
            });
          }}
        >
          Save bookmark
        </Button>
        {range ? (
          <Button
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => {
              for (let number = range.start; number <= range.end; number += 1) {
                void removeHighlight(verseId(translationId, bookId, chapter, number));
              }
              setHighlights((current) => {
                const next = new Map(current);
                for (let number = range.start; number <= range.end; number += 1) {
                  next.delete(verseId(translationId, bookId, chapter, number));
                }
                return next;
              });
            }}
          >
            Remove highlight if set
          </Button>
        ) : null}
      </Modal>
      <Modal open={sermonOpen} title="Add to sermon" onClose={() => setSermonOpen(false)}>
        <p className="mb-3 text-sm text-muted">
          {range ? selectionReference() : "Select a verse first"}
        </p>
        <div className="grid gap-2">
          {sermons.map((sermon) => (
            <button
              key={sermon.id}
              type="button"
              className="min-h-12 rounded-2xl bg-paper-2 px-3 text-left text-sm dark:bg-white/5"
              onClick={() => sermon.id && void addVersesToSermon(sermon.id)}
            >
              <span className="font-semibold">{sermon.title}</span>
              <span className="mt-1 block text-xs text-muted">{formatSundayLabel(sermon.sundayDate)}</span>
              {readActiveSermonId() === sermon.id ? (
                <span className="mt-1 block text-xs font-semibold text-gold">Currently collecting</span>
              ) : null}
            </button>
          ))}
        </div>
        <input
          className="mt-4 min-h-12 w-full rounded-2xl border border-navy/10 px-3 dark:border-white/10 dark:bg-white/5"
          placeholder="New Sunday sermon title"
          value={newSermonTitle}
          onChange={(event) => setNewSermonTitle(event.target.value)}
        />
        <Button
          className="mt-3 w-full"
          onClick={() => {
            void createSermon({ title: newSermonTitle.trim() || undefined }).then((id) => addVersesToSermon(id));
          }}
        >
          Create sermon and add verses
        </Button>
      </Modal>
    </div>
  );
}

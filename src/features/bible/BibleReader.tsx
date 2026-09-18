import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getBookById } from "@/data/books";
import { DEMO_BANNER } from "@/data/licenses";
import { BookSelector } from "@/components/bible/BookSelector";
import { ChapterSelector } from "@/components/bible/ChapterSelector";
import { BibleNavigator } from "@/components/bible/BibleNavigator";
import { ModeToggle, TranslationSelector } from "@/components/bible/TranslationSelector";
import { ParallelVerseRow } from "@/components/bible/ParallelVerseRow";
import { VerseContextMenu } from "@/components/bible/VerseContextMenu";
import { VerseRow } from "@/components/bible/VerseRow";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/useToast";
import { useWakeLock } from "@/hooks/useWakeLock";
import { adjacentChapter, getChapterVerses, getParallelVerses, getTranslation } from "@/services/bibleService";
import { addBookmark } from "@/services/bookmarkService";
import { getHighlightMap, removeHighlight, setHighlight } from "@/services/highlightService";
import { recordChapterOpen } from "@/services/historyService";
import { addNote } from "@/services/noteService";
import { markChapterRead } from "@/services/progressService";
import { copyText, formatParallelShare, formatVerseShare, shareOrCopy } from "@/services/shareService";
import type { VerseRecord } from "@/types/bible";
import type { HighlightColor } from "@/types/userData";
import { DEFAULT_BOOKMARK_CATEGORIES } from "@/types/userData";
import { FONT_PRESETS, type FontPreset } from "@/types/settings";
import { formatReference } from "@/utils/reference";
import { verseId } from "@/utils/text";
import { cn } from "@/utils/misc";

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
  const [pairs, setPairs] = useState<Array<{ number: number; tamil?: VerseRecord; english?: VerseRecord }>>([]);
  const [highlights, setHighlights] = useState<Map<string, { color: HighlightColor }>>(new Map());
  const [selected, setSelected] = useState<number | null>(verseParam || null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [goOpen, setGoOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState("Favorites");
  const [bookmarkCategory, setBookmarkCategory] = useState("Favorites");
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
        const nextPairs = await getParallelVerses(bookId, chapter);
        if (!cancelled) {
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
  }, [bookId, chapter, translationId, mode, verseParam, settings.rememberPosition, update]);

  useEffect(() => {
    if (!verseParam) return;
    const node = document.getElementById(`v-${verseParam}`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
    setSelected(verseParam);
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

  const selectedVerse = useMemo(() => {
    if (!selected) return undefined;
    if (mode === "parallel") {
      const pair = pairs.find((item) => item.number === selected);
      return settings.parallelOrder === "english-first" ? pair?.english ?? pair?.tamil : pair?.tamil ?? pair?.english;
    }
    return verses.find((item) => item.number === selected);
  }, [selected, mode, pairs, verses, settings.parallelOrder]);

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
    navigate(buildPath(nextBook, 1));
  }

  function changeChapter(nextChapter: number) {
    navigate(buildPath(bookId, nextChapter));
  }

  function changeTranslation(id: string) {
    const paramsObj = new URLSearchParams(searchParams);
    paramsObj.set("translation", id);
    setSearchParams(paramsObj);
    void update({ defaultTranslation: id as typeof settings.defaultTranslation });
  }

  function changeMode(next: "single" | "parallel") {
    const paramsObj = new URLSearchParams(searchParams);
    paramsObj.set("translation", translationId === "bsi-ov" ? "bsi-ov" : "kjv");
    paramsObj.set("mode", next);
    setSearchParams(paramsObj);
    void update({ readingMode: next });
  }

  function bumpFont(delta: number) {
    const index = Math.max(0, Math.min(FONT_ORDER.length - 1, FONT_ORDER.indexOf(settings.fontPreset) + delta));
    const preset = FONT_ORDER[index];
    void update({ fontPreset: preset, ...FONT_PRESETS[preset] });
  }

  function openMenu(number: number) {
    setSelected(number);
    setMenuOpen(true);
  }

  async function onHighlight(color: HighlightColor) {
    if (!selected) return;
    const id = verseId(translationId, bookId, chapter, selected);
    await setHighlight({
      verseId: id,
      translationId,
      bookId,
      chapter,
      verseNumber: selected,
      color,
    });
    setHighlights(new Map(highlights).set(id, { color }));
    setMenuOpen(false);
    push("Verse highlighted", "success");
  }

  async function handleAction(action: string) {
    if (!selected) return;
    const pair = pairs.find((item) => item.number === selected);
    const verse = selectedVerse;
    const text = verse?.text ?? "";
    const language = verse?.translationId === "bsi-ov" ? "ta" : "en";
    const shareText =
      mode === "parallel"
        ? formatParallelShare({
            bookId,
            chapter,
            verse: selected,
            tamil: pair?.tamil?.isPlaceholder ? undefined : pair?.tamil?.text,
            english: pair?.english?.text,
          })
        : formatVerseShare({ bookId, chapter, verse: selected, text, language });
    if (action === "copy") {
      await copyText(shareText);
      push("Copied", "success");
    }
    if (action === "share") {
      const result = await shareOrCopy("NJC Bible App", shareText);
      if (result === "copied") push("Copied", "success");
    }
    if (action === "bookmark") setBookmarkOpen(true);
    if (action === "note") setNoteOpen(true);
    if (action === "compare") changeMode("parallel");
    if (action === "search") navigate(`/search?q=${encodeURIComponent(text.slice(0, 40))}`);
    if (action === "image") {
      navigate("/verse-image", {
        state: { bookId, chapter, verse: selected, text, language, translationId },
      });
    }
    setMenuOpen(false);
  }

  const language = translationId === "bsi-ov" ? "ta" : "en";
  const empty =
    loaded &&
    (mode === "single"
      ? verses.length === 0
      : pairs.every((pair) => !pair.english && !pair.tamil));

  return (
    <div className={cn("safe-bottom min-h-screen", settings.distractionFree && "bg-paper dark:bg-[#090c10]")}>
      {settings.distractionFree ? (
        <div className="sticky top-0 z-20 flex justify-end p-3">
          <Button variant="ghost" onClick={() => void update({ distractionFree: false })}>
            Exit focus
          </Button>
        </div>
      ) : (
        <header className="sticky top-0 z-20 border-b border-navy/8 bg-paper/95 px-3 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0c1016]/95">
          <div className="mb-3 flex items-center gap-2">
            <button type="button" className="min-h-11 min-w-11 text-xl" aria-label="Back" onClick={() => navigate(-1)}>
              ←
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {book?.nameEnglish} {chapter}
              </p>
              <p className="tamil truncate text-xs text-muted">{book?.nameTamil}</p>
            </div>
            <button type="button" className="min-h-11 min-w-11 text-xl" aria-label="Search" onClick={() => navigate("/search")}>
              ⌕
            </button>
            <button type="button" className="min-h-11 min-w-11 text-xl" aria-label="Go to verse" onClick={() => setGoOpen(true)}>
              ⋮
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TranslationSelector value={translationId} onChange={changeTranslation} />
            <BookSelector value={bookId} onChange={changeBook} />
            <ChapterSelector bookId={bookId} value={chapter} onChange={changeChapter} />
            <ModeToggle value={mode} onChange={changeMode} />
            <div className="inline-flex rounded-full bg-navy/8 p-1 dark:bg-white/10" role="group" aria-label="Font size">
              <button type="button" className="min-h-10 min-w-10 text-sm" aria-label="Decrease font size" onClick={() => bumpFont(-1)}>
                A-
              </button>
              <button
                type="button"
                className="min-h-10 min-w-10 text-sm"
                aria-label="Medium font size"
                onClick={() => void update({ fontPreset: "medium", ...FONT_PRESETS.medium })}
              >
                A
              </button>
              <button type="button" className="min-h-10 min-w-10 text-sm" aria-label="Increase font size" onClick={() => bumpFont(1)}>
                A+
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto max-w-3xl px-4 py-6">
        {demo && translationId === "bsi-ov" ? (
          <p className="mb-4 rounded-2xl bg-gold-soft/60 px-4 py-3 text-sm text-navy-deep">
            {DEMO_BANNER}. Licensed BSI OV text is not included. Placeholder verses are not Scripture.
          </p>
        ) : null}
        {missing || empty ? (
          <div className="rounded-3xl bg-white/80 p-6 dark:bg-white/5">
            {translationId === "bsi-ov" ? (
              <>
                <p className="font-semibold">BSI Tamil O.V. Bible data has not been installed.</p>
                <p className="mt-2 text-sm text-muted">
                  Import an authorized BSI Tamil O.V. dataset from Settings → Bible Data.
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

        <h2 className="mb-6 text-center">
          <span className="tamil block text-2xl">{book?.nameTamil}</span>
          <span className="text-4xl font-semibold text-navy dark:text-gold">{chapter}</span>
        </h2>

        {mode === "single"
          ? verses.map((verse) => (
              <VerseRow
                key={verse.id}
                verse={verse}
                showNumber={settings.showVerseNumbers}
                language={language}
                highlight={highlights.get(verse.id)?.color}
                selected={selected === verse.number}
                continuous={!settings.verseByVerse}
                serif={language === "ta" ? settings.tamilFont === "serif" : settings.englishFont === "serif"}
                onActivate={() => setSelected(verse.number)}
                onLongPress={() => openMenu(verse.number)}
              />
            ))
          : pairs.map((pair) => (
              <ParallelVerseRow
                key={pair.number}
                number={pair.number}
                tamil={pair.tamil}
                english={pair.english}
                order={settings.parallelOrder}
                layout={layout}
                showNumber={settings.showVerseNumbers}
                selected={selected === pair.number}
                onActivate={() => setSelected(pair.number)}
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

      <VerseContextMenu
        open={menuOpen}
        reference={formatReference(bookId, chapter, selected ?? 1, language)}
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
            if (!selected || !noteText.trim()) return;
            void addNote({
              translationId,
              bookId,
              chapter,
              verseNumber: selected,
              verseId: verseId(translationId, bookId, chapter, selected),
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
            if (!selected) return;
            void addBookmark({
              translationId,
              bookId,
              chapter,
              verseStart: selected,
              verseEnd: selected,
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
        {selected ? (
          <Button
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => {
              void removeHighlight(verseId(translationId, bookId, chapter, selected));
            }}
          >
            Remove highlight if set
          </Button>
        ) : null}
      </Modal>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { db } from "@/db";
import { formatReference } from "@/utils/reference";
import { translationUiLanguage } from "@/config/translations";
import { getChapterVerses } from "@/services/bibleService";

function maskText(text: string, revealRatio: number): string {
  const words = text.split(/\s+/);
  const keep = Math.max(1, Math.floor(words.length * revealRatio));
  return words.map((word, index) => (index < keep ? word : "____")).join(" ");
}

export function MemoryPage() {
  const navigate = useNavigate();
  const bookmarks =
    useLiveQuery(
      async () => {
        const rows = await db.bookmarks.toArray();
        return rows
          .filter((row) => row.category === "Memory")
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      },
      [],
    ) ?? [];
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(0.35);
  const [text, setText] = useState("");
  const current = bookmarks[index];

  useEffect(() => {
    if (!current) {
      setText("");
      return;
    }
    let cancelled = false;
    void getChapterVerses(current.translationId, current.bookId, current.chapter).then((verses) => {
      if (cancelled) return;
      const body = verses
        .filter((verse) => verse.number >= current.verseStart && verse.number <= current.verseEnd)
        .map((verse) => verse.text)
        .join(" ");
      setText(body);
    });
    return () => {
      cancelled = true;
    };
  }, [current]);

  const masked = useMemo(() => (text ? maskText(text, reveal) : ""), [text, reveal]);

  return (
    <Page title="Memory verses" subtitle="Spaced practice from Memory folder" back>
      {bookmarks.length === 0 ? (
        <p className="text-sm text-muted">
          Bookmark verses into the <strong>Memory</strong> folder, then practice them here.
        </p>
      ) : (
        <div className="grid gap-4">
          <Card>
            <p className="text-xs tracking-[0.2em] text-gold uppercase">
              {index + 1} / {bookmarks.length}
            </p>
            <p className="mt-2 font-semibold">
              {formatReference(
                current!.bookId,
                current!.chapter,
                current!.verseStart,
                translationUiLanguage(current!.translationId),
              )}
              {current!.verseEnd !== current!.verseStart
                ? `-${current!.verseEnd}`
                : ""}
            </p>
            <p className="mt-4 text-base leading-relaxed">{masked || "Loading…"}</p>
            <label className="mt-4 block text-sm">
              Reveal words ({Math.round(reveal * 100)}%)
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={reveal}
                onChange={(event) => setReveal(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setReveal(1)}>
              Show all
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIndex((value) => (value + 1) % bookmarks.length)}
            >
              Next card
            </Button>
            <Button
              onClick={() =>
                navigate(
                  `/bible/${current!.bookId}/${current!.chapter}?verse=${current!.verseStart}&translation=${current!.translationId}`,
                )
              }
            >
              Open verse
            </Button>
          </div>
        </div>
      )}
    </Page>
  );
}

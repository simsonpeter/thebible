import { BOOK_CATALOG, NT_CHAPTERS, OT_CHAPTERS, TOTAL_CHAPTERS, getBookById } from "@/data/books";
import { db } from "@/db";
import type { ReadingProgressRecord } from "@/types/userData";
import { nowIso } from "@/utils/misc";

export async function markChapterRead(bookId: string, chapter: number): Promise<void> {
  await db.readingProgress.put({ bookId, chapter, readAt: nowIso() });
}

export async function listProgress(): Promise<ReadingProgressRecord[]> {
  return db.readingProgress.toArray();
}

export async function getProgressSummary(): Promise<{
  ot: number;
  nt: number;
  whole: number;
  chaptersRead: number;
  booksOpened: number;
}> {
  const rows = await listProgress();
  const books = new Set(rows.map((row) => row.bookId));
  let ot = 0;
  let nt = 0;
  for (const row of rows) {
    const book = getBookById(row.bookId);
    if (book?.testament === "OT") ot += 1;
    if (book?.testament === "NT") nt += 1;
  }
  return {
    ot: OT_CHAPTERS ? Math.round((ot / OT_CHAPTERS) * 100) : 0,
    nt: NT_CHAPTERS ? Math.round((nt / NT_CHAPTERS) * 100) : 0,
    whole: TOTAL_CHAPTERS ? Math.round((rows.length / TOTAL_CHAPTERS) * 100) : 0,
    chaptersRead: rows.length,
    booksOpened: books.size,
  };
}

export function catalogBookCount(): number {
  return BOOK_CATALOG.length;
}

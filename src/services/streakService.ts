import { db } from "@/db";
import { todayKey } from "@/utils/misc";

/** Count consecutive days (ending today or yesterday) with at least one chapter marked read. */
export async function getReadingStreak(): Promise<{ current: number; readToday: boolean }> {
  const rows = await db.readingProgress.toArray();
  const days = new Set(rows.map((row) => row.readAt.slice(0, 10)));
  const today = todayKey();
  const readToday = days.has(today);

  let current = 0;
  const cursor = new Date(`${today}T12:00:00`);
  if (!readToday) {
    cursor.setDate(cursor.getDate() - 1);
  }
  for (;;) {
    const key = todayKey(cursor);
    if (!days.has(key)) break;
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { current, readToday };
}

export async function listFinishedBooks(): Promise<string[]> {
  const rows = await db.readingProgress.toArray();
  const byBook = new Map<string, Set<number>>();
  for (const row of rows) {
    const set = byBook.get(row.bookId) ?? new Set<number>();
    set.add(row.chapter);
    byBook.set(row.bookId, set);
  }
  const { BOOK_CATALOG } = await import("@/data/books");
  return BOOK_CATALOG.filter((book) => (byBook.get(book.id)?.size ?? 0) >= book.chapterCount).map((book) => book.id);
}

export async function isBookFinished(bookId: string): Promise<boolean> {
  const finished = await listFinishedBooks();
  return finished.includes(bookId);
}

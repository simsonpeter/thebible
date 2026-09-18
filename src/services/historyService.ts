import { db } from "@/db";
import type { ReadingHistoryRecord } from "@/types/userData";
import { nowIso } from "@/utils/misc";

const HISTORY_LIMIT = 50;

export async function recordChapterOpen(
  translationId: string,
  bookId: string,
  chapter: number,
): Promise<void> {
  await db.readingHistory.add({
    translationId,
    bookId,
    chapter,
    openedAt: nowIso(),
  });
  const extra = await db.readingHistory.orderBy("openedAt").reverse().offset(HISTORY_LIMIT).toArray();
  if (extra.length) {
    await db.readingHistory.bulkDelete(extra.map((row) => row.id).filter((id): id is number => typeof id === "number"));
  }
}

export async function listRecentHistory(limit = 5): Promise<ReadingHistoryRecord[]> {
  const rows = await db.readingHistory.orderBy("openedAt").reverse().limit(40).toArray();
  const seen = new Set<string>();
  const unique: ReadingHistoryRecord[] = [];
  for (const row of rows) {
    const key = `${row.bookId}:${row.chapter}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
    if (unique.length >= limit) break;
  }
  return unique;
}

export async function clearHistory(): Promise<void> {
  await db.readingHistory.clear();
}

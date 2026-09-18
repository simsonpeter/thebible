import { db } from "@/db";
import type { HighlightColor, HighlightRecord } from "@/types/userData";
import { nowIso } from "@/utils/misc";

export async function listHighlights(): Promise<HighlightRecord[]> {
  return db.highlights.orderBy("createdAt").reverse().toArray();
}

export async function getHighlightMap(
  translationId: string,
  bookId: string,
  chapter: number,
): Promise<Map<string, HighlightRecord>> {
  const rows = await db.highlights
    .where("translationId")
    .equals(translationId)
    .filter((row) => row.bookId === bookId && row.chapter === chapter)
    .toArray();
  return new Map(rows.map((row) => [row.verseId, row]));
}

export async function setHighlight(record: Omit<HighlightRecord, "createdAt"> & { createdAt?: string }): Promise<void> {
  await db.highlights.put({ ...record, createdAt: record.createdAt ?? nowIso() });
}

export async function removeHighlight(verseId: string): Promise<void> {
  await db.highlights.delete(verseId);
}

export const HIGHLIGHT_COLORS: HighlightColor[] = ["yellow", "green", "blue", "pink", "orange"];

import { TRANSLATION_OPTIONS, resolveParallelSelection } from "@/config/translations";
import { BOOK_CATALOG, getBookById } from "@/data/books";
import { db } from "@/db";
import type { TranslationMeta, VerseRecord } from "@/types/bible";
import type { ParallelOrder } from "@/types/settings";

export interface ParallelVerse {
  number: number;
  byId: Record<string, VerseRecord | undefined>;
}

export async function listTranslations(): Promise<TranslationMeta[]> {
  return db.translations.orderBy("id").toArray();
}

export async function getTranslation(id: string): Promise<TranslationMeta | undefined> {
  return db.translations.get(id);
}

export async function getChapterVerses(
  translationId: string,
  bookId: string,
  chapter: number,
): Promise<VerseRecord[]> {
  return db.verses
    .where("[translationId+bookId+chapter]")
    .equals([translationId, bookId, chapter])
    .sortBy("number");
}

export async function getVerse(
  translationId: string,
  bookId: string,
  chapter: number,
  number: number,
): Promise<VerseRecord | undefined> {
  return db.verses
    .where("[translationId+bookId+chapter+number]")
    .equals([translationId, bookId, chapter, number])
    .first();
}

export async function countVerses(translationId: string): Promise<number> {
  return db.verses.where("translationId").equals(translationId).count();
}

export function adjacentChapter(bookId: string, chapter: number, delta: number): {
  bookId: string;
  chapter: number;
} | null {
  const book = getBookById(bookId);
  if (!book) return null;
  const nextChapter = chapter + delta;
  if (nextChapter >= 1 && nextChapter <= book.chapterCount) {
    return { bookId, chapter: nextChapter };
  }
  const index = BOOK_CATALOG.findIndex((item) => item.id === bookId);
  const neighbor = BOOK_CATALOG[index + delta];
  if (!neighbor) return null;
  return {
    bookId: neighbor.id,
    chapter: delta > 0 ? 1 : neighbor.chapterCount,
  };
}

export async function listParallelTranslationIds(
  order: ParallelOrder = "tamil-first",
  selected?: readonly string[],
): Promise<string[]> {
  const rows = await db.translations.toArray();
  const available = new Set(rows.filter((row) => row.verseCount > 0).map((row) => row.id));
  const ids: string[] = TRANSLATION_OPTIONS.map((option) => option.id as string).filter((id) => available.has(id));
  for (const id of available) {
    if (!ids.includes(id)) ids.push(id);
  }
  return resolveParallelSelection(selected, ids, order);
}

export async function getParallelVerses(
  bookId: string,
  chapter: number,
  translationIds?: string[],
): Promise<ParallelVerse[]> {
  const ids = translationIds?.length ? translationIds : await listParallelTranslationIds();
  const chapters = await Promise.all(ids.map((id) => getChapterVerses(id, bookId, chapter)));
  const numbers = new Set<number>();
  const maps = chapters.map((verses) => {
    for (const verse of verses) numbers.add(verse.number);
    return new Map(verses.map((verse) => [verse.number, verse]));
  });
  return [...numbers]
    .sort((a, b) => a - b)
    .map((number) => {
      const byId: Record<string, VerseRecord | undefined> = {};
      ids.forEach((id, index) => {
        byId[id] = maps[index]?.get(number);
      });
      return { number, byId };
    });
}

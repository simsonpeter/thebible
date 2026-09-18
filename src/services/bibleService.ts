import { BOOK_CATALOG, getBookById } from "@/data/books";
import { db } from "@/db";
import type { TranslationMeta, VerseRecord } from "@/types/bible";

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

export async function getParallelVerses(
  bookId: string,
  chapter: number,
  tamilId = "bsi-ov",
  englishId = "kjv",
): Promise<Array<{ number: number; tamil?: VerseRecord; english?: VerseRecord }>> {
  const [tamil, english] = await Promise.all([
    getChapterVerses(tamilId, bookId, chapter),
    getChapterVerses(englishId, bookId, chapter),
  ]);
  const numbers = new Set<number>();
  for (const verse of tamil) numbers.add(verse.number);
  for (const verse of english) numbers.add(verse.number);
  const tamilMap = new Map(tamil.map((verse) => [verse.number, verse]));
  const englishMap = new Map(english.map((verse) => [verse.number, verse]));
  return [...numbers]
    .sort((a, b) => a - b)
    .map((number) => ({
      number,
      tamil: tamilMap.get(number),
      english: englishMap.get(number),
    }));
}

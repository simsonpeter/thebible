import { db } from "@/db";
import { publicUrl } from "@/utils/publicUrl";
import {
  adjacentChapter,
  countVerses,
  getChapterVerses,
  getParallelVerses,
  getTranslation,
  getVerse,
  listTranslations,
} from "@/services/bibleService";

export const bibleBooks = db.books;
export const bibleVerses = db.verses;

export const BibleRepository = {
  listTranslations,
  getTranslation,
  getChapterVerses,
  getVerse,
  getParallelVerses,
  countVerses,
  adjacentChapter,
  bibleBooks,
  bibleVerses,
};

export async function isBsiInstalled(): Promise<boolean> {
  const translation = await db.translations.get("bsi-ov");
  return Boolean(translation && !translation.isDemo && translation.verseCount > 0);
}

export async function isKjvInstalled(): Promise<boolean> {
  const translation = await db.translations.get("kjv");
  return Boolean(translation && translation.verseCount > 0);
}

export async function bundledBsiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(publicUrl("bible-data/bsi-ov/bsi-ov.json"));
    if (!response.ok) return false;
    const text = await response.text();
    const start = text.trimStart().slice(0, 15).toLowerCase();
    return Boolean(text.trim()) && !start.startsWith("<!doctype") && !start.startsWith("<html");
  } catch {
    return false;
  }
}

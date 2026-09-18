import { db } from "@/db";
import type { VerseRecord } from "@/types/bible";
import { BOOK_CATALOG } from "@/data/books";
import { todayKey } from "@/utils/misc";

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function dailyIndex(total: number, dateKey = todayKey(), salt = 0): number {
  if (total <= 0) return 0;
  return hashString(`${dateKey}:${salt}`) % total;
}

export async function getDailyVerse(salt = 0): Promise<VerseRecord | undefined> {
  const chapters = await db.chapters.where("translationId").equals("kjv").toArray();
  if (!chapters.length) return undefined;
  const bookOrder = new Map(BOOK_CATALOG.map((book) => [book.id, book.order]));
  chapters.sort((a, b) => {
    const order = (bookOrder.get(a.bookId) ?? 0) - (bookOrder.get(b.bookId) ?? 0);
    return order !== 0 ? order : a.number - b.number;
  });
  const total = chapters.reduce((sum, chapter) => sum + chapter.verseCount, 0);
  if (!total) return undefined;
  let remaining = dailyIndex(total, todayKey(), salt);
  for (const chapter of chapters) {
    if (remaining < chapter.verseCount) {
      return db.verses.get(`kjv:${chapter.bookId}:${chapter.number}:${remaining + 1}`);
    }
    remaining -= chapter.verseCount;
  }
  return undefined;
}

export async function getDailyVersePair(salt = 0): Promise<{
  english?: VerseRecord;
  tamil?: VerseRecord;
}> {
  const english = await getDailyVerse(salt);
  if (!english) return {};
  const tamil = await db.verses.get(`bsi-ov:${english.bookId}:${english.chapter}:${english.number}`);
  return {
    english,
    tamil: tamil && !tamil.isPlaceholder ? tamil : undefined,
  };
}

import { db } from "@/db";
import { PROMISE_VERSES } from "@/data/promiseVerses";
import type { VerseRecord } from "@/types/bible";
import { todayKey } from "@/utils/misc";

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Stable index into a list for a calendar day (+ optional salt). */
export function dailyIndex(total: number, dateKey = todayKey(), salt = 0): number {
  if (total <= 0) return 0;
  return hashString(`${dateKey}:${salt}`) % total;
}

export function getPromiseOfTheDayRef(salt = 0, dateKey = todayKey()) {
  const index = dailyIndex(PROMISE_VERSES.length, dateKey, salt);
  return PROMISE_VERSES[index]!;
}

/** Loads today’s promise from KJV (source of selection), then Tamil if installed. */
export async function getDailyVerse(salt = 0): Promise<VerseRecord | undefined> {
  const ref = getPromiseOfTheDayRef(salt);
  return db.verses.get(`kjv:${ref.bookId}:${ref.chapter}:${ref.verse}`);
}

export async function getDailyVersePair(salt = 0): Promise<{
  english?: VerseRecord;
  tamil?: VerseRecord;
}> {
  const ref = getPromiseOfTheDayRef(salt);
  const [english, tamil] = await Promise.all([
    db.verses.get(`kjv:${ref.bookId}:${ref.chapter}:${ref.verse}`),
    db.verses.get(`bsi-ov:${ref.bookId}:${ref.chapter}:${ref.verse}`),
  ]);
  return {
    english: english && !english.isPlaceholder ? english : undefined,
    tamil: tamil && !tamil.isPlaceholder ? tamil : undefined,
  };
}

import type { StrongDictionaryFile, StrongEntry, StrongLanguage } from "@/types/strongs";
import { normalizeForSearch } from "@/utils/text";
import { publicUrl } from "@/utils/publicUrl";

export const STRONG_RESULT_LIMIT = 40;

let cached: Promise<StrongEntry[]> | null = null;

export function normalizeStrongId(value: string): string | null {
  const compact = value.trim().toUpperCase().replace(/[\s:.-]/g, "");
  const match = compact.match(/^([HG])(\d{1,4})$/);
  if (!match) return null;
  return `${match[1]}${Number(match[2])}`;
}

export function parseStrongNumber(value: string): number | null {
  const compact = value.trim().replace(/[\s:.-]/g, "");
  const match = compact.match(/^(?:[HGhg])?(\d{1,4})$/);
  if (!match) return null;
  return Number(match[1]);
}

export async function loadStrongEntries(): Promise<StrongEntry[]> {
  if (!cached) {
    cached = (async () => {
      const response = await fetch(publicUrl("bible-data/strongs/strongs.json"));
      if (!response.ok) throw new Error("Strong's dictionary is not installed.");
      const payload = (await response.json()) as StrongDictionaryFile;
      return payload.entries ?? [];
    })();
  }
  return cached;
}

export function searchStrongEntries(
  entries: StrongEntry[],
  query: string,
  language: StrongLanguage | "both" = "both",
): StrongEntry[] {
  const scoped = language === "both" ? entries : entries.filter((entry) => entry.language === language);
  const exactId = normalizeStrongId(query);
  if (exactId) {
    const hit = scoped.find((entry) => entry.id === exactId);
    return hit ? [hit] : [];
  }

  const number = parseStrongNumber(query);
  if (number !== null) {
    return scoped.filter((entry) => Number(entry.id.slice(1)) === number).slice(0, STRONG_RESULT_LIMIT);
  }

  const needle = normalizeForSearch(query);
  if (needle.length < 2) return [];

  const ranked = scoped
    .map((entry) => ({ entry, score: scoreEntry(entry, needle) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || compareStrongIds(left.entry.id, right.entry.id));

  return ranked.slice(0, STRONG_RESULT_LIMIT).map((item) => item.entry);
}

export function compareStrongIds(left: string, right: string): number {
  const leftLang = left.startsWith("H") ? 0 : 1;
  const rightLang = right.startsWith("H") ? 0 : 1;
  if (leftLang !== rightLang) return leftLang - rightLang;
  return Number(left.slice(1)) - Number(right.slice(1));
}

function scoreEntry(entry: StrongEntry, needle: string): number {
  const short = normalizeForSearch(entry.shortDefinition);
  const transliteration = normalizeForSearch(entry.transliteration);
  const pronunciation = normalizeForSearch(entry.pronunciation);
  const lexeme = normalizeForSearch(entry.lexeme);
  const tamil = normalizeForSearch(entry.tamil);
  const english = normalizeForSearch(entry.english);
  if (short === needle || transliteration === needle || lexeme === needle) return 100;
  if (startsWithWord(short, needle) || startsWithWord(transliteration, needle)) return 80;
  if (short.includes(needle) || transliteration.includes(needle) || pronunciation.includes(needle)) return 60;
  if (tamil.includes(needle) || english.includes(needle) || lexeme.includes(needle)) return 40;
  return 0;
}

function startsWithWord(haystack: string, needle: string): boolean {
  return haystack.split(" ").some((word) => word.startsWith(needle));
}

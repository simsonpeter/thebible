import type { BibleLanguage } from "@/types/bible";

export function verseId(
  translationId: string,
  bookId: string,
  chapter: number,
  verse: number,
): string {
  return `${translationId}:${bookId}:${chapter}:${verse}`;
}

export function parseVerseId(id: string): {
  translationId: string;
  bookId: string;
  chapter: number;
  verse: number;
} | null {
  const parts = id.split(":");
  if (parts.length < 4) return null;
  const verse = Number(parts[parts.length - 1]);
  const chapter = Number(parts[parts.length - 2]);
  const translationId = parts[0];
  const bookId = parts.slice(1, -2).join(":");
  if (!translationId || !bookId || !Number.isInteger(chapter) || !Number.isInteger(verse)) {
    return null;
  }
  return { translationId, bookId, chapter, verse };
}

export function syncKey(bookId: string, chapter: number, verse: number): string {
  return `${bookId}:${chapter}:${verse}`;
}

export function normalizeForSearch(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[{}¶]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string, _language: BibleLanguage): string[] {
  const normalized = normalizeForSearch(text);
  const parts = normalized.split(/[^\p{L}\p{M}\p{N}]+/u).filter((token) => token.length >= 2);
  return [...new Set(parts)];
}

export function cleanSourceVerseText(text: string): string {
  return text.replace(/[{}]/g, "").replace(/¶/g, "").replace(/\s+/g, " ").trim();
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

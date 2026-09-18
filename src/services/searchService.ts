import { db } from "@/db";
import type { VerseRecord } from "@/types/bible";
import { otBooks, ntBooks } from "@/data/books";
import { normalizeForSearch } from "@/utils/text";

export type SearchScope = "current" | "both" | "book" | "ot" | "nt";
export type SearchLanguage = "ta" | "en" | "both";

export interface SearchQuery {
  text: string;
  translationId: string;
  scope: SearchScope;
  language?: SearchLanguage;
  exact?: boolean;
  bookId?: string;
}

export interface SearchHit {
  verse: VerseRecord;
  snippet: string;
}

const RESULT_LIMIT = 80;

function matchesScope(verse: VerseRecord, query: SearchQuery, ot: Set<string>, nt: Set<string>): boolean {
  if (query.scope === "book") return verse.bookId === query.bookId;
  if (query.scope === "ot") return ot.has(verse.bookId);
  if (query.scope === "nt") return nt.has(verse.bookId);
  return true;
}

function snippet(text: string, needle: string): string {
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) return text.slice(0, 140);
  const start = Math.max(0, index - 42);
  const end = Math.min(text.length, index + needle.length + 42);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

export async function searchBible(query: SearchQuery): Promise<SearchHit[]> {
  const quoted = query.text.trim().match(/^["“](.+)["”]$/);
  const raw = quoted?.[1] ?? query.text;
  const needle = normalizeForSearch(raw);
  if (needle.length < 2) return [];
  const exact = query.exact || Boolean(quoted);

  const language = query.language ?? "both";
  const translationIds =
    language === "ta"
      ? ["bsi-ov"]
      : language === "en"
        ? ["kjv"]
        : query.scope === "both"
          ? ["bsi-ov", "kjv"]
          : [query.translationId];
  const ot = new Set(otBooks().map((book) => book.id));
  const nt = new Set(ntBooks().map((book) => book.id));
  const hits: SearchHit[] = [];

  for (const translationId of translationIds) {
    const rows = await db.verses
      .where("translationId")
      .equals(translationId)
      .filter((verse) => {
        if (!matchesScope(verse, query, ot, nt) || verse.isPlaceholder) return false;
        if (exact) return verse.normalizedText.includes(needle);
        return verse.normalizedText.includes(needle) || verse.tokens.some((token) => token.includes(needle));
      })
      .limit(RESULT_LIMIT)
      .toArray();
    for (const verse of rows) {
      hits.push({ verse, snippet: snippet(verse.text, needle) });
      if (hits.length >= RESULT_LIMIT) return hits;
    }
  }

  return hits;
}

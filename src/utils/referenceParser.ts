import { BOOK_CATALOG, getBookByAlias, getBookById, normalizeAlias } from "@/data/books";
import type { BookDefinition } from "@/types/bible";

export interface ParsedReference {
  book: BookDefinition;
  chapter?: number;
  verse?: number;
  raw: string;
}

export function parseReference(input: string): ParsedReference | null {
  const raw = input.replace(/\s+/g, " ").trim();
  if (!raw) return null;

  const sortedAliases = BOOK_CATALOG.flatMap((book) => [
    book.nameEnglish,
    book.nameTamil,
    book.id.replace(/-/g, " "),
    ...book.aliases,
  ]).sort((a, b) => b.length - a.length);

  const lowered = normalizeAlias(raw);
  for (const alias of sortedAliases) {
    const aliasNorm = normalizeAlias(alias);
    if (lowered === aliasNorm) {
      const book = getBookByAlias(alias);
      return book ? { book, raw } : null;
    }
    if (lowered.startsWith(`${aliasNorm} `) || lowered.startsWith(`${aliasNorm}:`)) {
      const rest = raw.slice(alias.length).replace(/^[\s:]+/, "");
      const match = rest.match(/^(\d+)(?:\s*[.:]\s*(\d+))?$/);
      const book = getBookByAlias(alias);
      if (!book || !match) continue;
      return {
        book,
        chapter: Number(match[1]),
        verse: match[2] ? Number(match[2]) : undefined,
        raw,
      };
    }
  }

  const fallback = raw.match(/^(.+?)\s+(\d+)(?:\s*[.:]\s*(\d+))?$/);
  if (fallback) {
    const book = getBookByAlias(fallback[1]);
    if (book) {
      return {
        book,
        chapter: Number(fallback[2]),
        verse: fallback[3] ? Number(fallback[3]) : undefined,
        raw,
      };
    }
  }

  const bookOnly = getBookByAlias(raw) ?? getBookById(raw);
  return bookOnly ? { book: bookOnly, raw } : null;
}

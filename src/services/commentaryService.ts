import { BOOK_CATALOG, bookDisplayName, getBookById } from "@/data/books";
import type { CommentaryBook, CommentaryFile } from "@/types/commentary";
import { publicUrl } from "@/utils/publicUrl";
import { normalizeForSearch } from "@/utils/text";

export const COMMENTARY_CDN_BASE =
  "https://cdn.jsdelivr.net/gh/yesudas/good-news-brief-commentary@main/";
export const COMMENTARY_RAW_BASE =
  "https://raw.githubusercontent.com/yesudas/good-news-brief-commentary/main/";
export const COMMENTARY_ASSET_FOLDER = "வேதாகமம்-சுருக்கவுரை/assets";

let cached: Promise<CommentaryBook[]> | null = null;

export function commentaryPageUrl(file: string, base = COMMENTARY_CDN_BASE): string {
  const folder = COMMENTARY_ASSET_FOLDER.split("/").map(encodeURIComponent).join("/");
  return `${base}${folder}/${encodeURIComponent(file)}`;
}

export function commentaryPageFallbackUrl(file: string): string {
  return commentaryPageUrl(file, COMMENTARY_RAW_BASE);
}

export async function loadCommentaryBooks(): Promise<CommentaryBook[]> {
  if (!cached) {
    cached = (async () => {
      const response = await fetch(publicUrl("bible-data/commentary/commentary.json"));
      if (!response.ok) throw new Error("Brief Commentary is not installed.");
      const payload = (await response.json()) as CommentaryFile;
      const byId = new Map(payload.books.map((book) => [book.id, book]));
      return BOOK_CATALOG.map((book) => byId.get(book.id)).filter((book): book is CommentaryBook => Boolean(book));
    })();
  }
  return cached;
}

export function getCommentaryBook(books: CommentaryBook[], bookId: string): CommentaryBook | undefined {
  return books.find((book) => book.id === bookId);
}

export function adjacentCommentaryBook(
  books: CommentaryBook[],
  bookId: string,
  delta: number,
): CommentaryBook | undefined {
  const index = books.findIndex((book) => book.id === bookId);
  if (index < 0) return undefined;
  return books[index + delta];
}

export function searchCommentaryBooks(books: CommentaryBook[], query: string): CommentaryBook[] {
  const needle = normalizeForSearch(query);
  if (!needle) return books;
  return books.filter((book) => {
    const catalog = getBookById(book.id);
    if (!catalog) return book.id.includes(needle);
    return (
      normalizeForSearch(catalog.nameEnglish).includes(needle) ||
      normalizeForSearch(catalog.nameTamil).includes(needle) ||
      catalog.aliases.some((alias) => normalizeForSearch(alias).includes(needle))
    );
  });
}

export function commentaryBookLabel(bookId: string, language: "en" | "ta"): string {
  return bookDisplayName(bookId, language);
}

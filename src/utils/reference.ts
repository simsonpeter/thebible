import { getBookById } from "@/data/books";

export function formatReference(
  bookId: string,
  chapter: number,
  verse?: number,
  language: "en" | "ta" = "en",
): string {
  const book = getBookById(bookId);
  const name = language === "ta" ? (book?.nameTamil ?? bookId) : (book?.nameEnglish ?? bookId);
  if (verse) return `${name} ${chapter}:${verse}`;
  return `${name} ${chapter}`;
}

export function formatRange(
  bookId: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
  language: "en" | "ta" = "en",
): string {
  if (verseStart === verseEnd) return formatReference(bookId, chapter, verseStart, language);
  const book = getBookById(bookId);
  const name = language === "ta" ? (book?.nameTamil ?? bookId) : (book?.nameEnglish ?? bookId);
  return `${name} ${chapter}:${verseStart}-${verseEnd}`;
}

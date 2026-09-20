import { BOOK_CATALOG, bookDisplayName, getBookById } from "@/data/books";
import type {
  CommentaryBook,
  CommentaryChapter,
  CommentaryEditionId,
  CommentaryFile,
} from "@/types/commentary";
import { publicUrl } from "@/utils/publicUrl";
import { normalizeForSearch } from "@/utils/text";

export type CommentaryEditionMeta = {
  id: CommentaryEditionId;
  title: string;
  titleTamil: string;
  catalogPath: string;
  cdnBase: string;
  rawBase: string;
  rootFolder: string;
};

export const COMMENTARY_EDITIONS: Record<CommentaryEditionId, CommentaryEditionMeta> = {
  brief: {
    id: "brief",
    title: "Brief Commentary",
    titleTamil: "வேதாகமம் சுருக்கவுரை",
    catalogPath: "bible-data/commentary/commentary.json",
    cdnBase: "https://cdn.jsdelivr.net/gh/yesudas/good-news-brief-commentary@main/",
    rawBase: "https://raw.githubusercontent.com/yesudas/good-news-brief-commentary/main/",
    rootFolder: "வேதாகமம்-சுருக்கவுரை",
  },
  full: {
    id: "full",
    title: "Full Commentary",
    titleTamil: "வேதாகமம் விரிவுரை",
    catalogPath: "bible-data/commentary/full-commentary.json",
    cdnBase: "https://cdn.jsdelivr.net/gh/yesudas/good-news-tamil-bible-commentary@main/",
    rawBase: "https://raw.githubusercontent.com/yesudas/good-news-tamil-bible-commentary/main/",
    rootFolder: "வேதாகமம்-விரிவுரை",
  },
};

const cache = new Map<CommentaryEditionId, Promise<CommentaryBook[]>>();

function encodePath(parts: string[]): string {
  return parts.map((part) => encodeURIComponent(part)).join("/");
}

export function commentaryPageUrl(
  edition: CommentaryEditionId,
  file: string,
  section?: string,
  base?: string,
): string {
  const meta = COMMENTARY_EDITIONS[edition];
  const origin = base ?? meta.cdnBase;
  if (edition === "brief") {
    return `${origin}${encodePath([meta.rootFolder, "assets", file])}`;
  }
  if (!section) {
    throw new Error("Full commentary pages require a section folder.");
  }
  return `${origin}${encodePath([meta.rootFolder, section, "assets", file])}`;
}

export function commentaryPageFallbackUrl(
  edition: CommentaryEditionId,
  file: string,
  section?: string,
): string {
  return commentaryPageUrl(edition, file, section, COMMENTARY_EDITIONS[edition].rawBase);
}

export async function loadCommentaryBooks(edition: CommentaryEditionId): Promise<CommentaryBook[]> {
  let pending = cache.get(edition);
  if (!pending) {
    pending = (async () => {
      const meta = COMMENTARY_EDITIONS[edition];
      const response = await fetch(publicUrl(meta.catalogPath));
      if (!response.ok) throw new Error(`${meta.title} is not installed.`);
      const payload = (await response.json()) as CommentaryFile;
      const byId = new Map(payload.books.map((book) => [book.id, book]));
      return BOOK_CATALOG.map((book) => byId.get(book.id)).filter((book): book is CommentaryBook => Boolean(book));
    })();
    cache.set(edition, pending);
  }
  return pending;
}

export function getCommentaryBook(books: CommentaryBook[], bookId: string): CommentaryBook | undefined {
  return books.find((book) => book.id === bookId);
}

export function getCommentaryChapter(
  book: CommentaryBook | undefined,
  chapterId: string,
): CommentaryChapter | undefined {
  return book?.chapters?.find((chapter) => chapter.id === chapterId);
}

export function commentaryBookPageCount(book: CommentaryBook): number {
  if (book.pages?.length) return book.pages.length;
  return book.chapters?.reduce((sum, chapter) => sum + chapter.pages.length, 0) ?? 0;
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

export function adjacentCommentaryChapter(
  book: CommentaryBook | undefined,
  chapterId: string,
  delta: number,
): CommentaryChapter | undefined {
  const chapters = book?.chapters;
  if (!chapters?.length) return undefined;
  const index = chapters.findIndex((chapter) => chapter.id === chapterId);
  if (index < 0) return undefined;
  return chapters[index + delta];
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

export function commentaryChapterLabel(chapterId: string): string {
  if (chapterId === "int") return "Introduction";
  return `Chapter ${chapterId}`;
}

export function isCommentaryEdition(value: string | undefined): value is CommentaryEditionId {
  return value === "brief" || value === "full";
}

/** Legacy `/commentary/:book` links still open the brief edition. */
export function resolveCommentaryRoute(params: {
  edition?: string;
  book?: string;
  chapter?: string;
}): { edition: CommentaryEditionId | null; bookId?: string; chapterId?: string; legacyBook?: string } {
  const { edition, book, chapter } = params;
  if (!edition) return { edition: null };
  if (isCommentaryEdition(edition)) {
    return { edition, bookId: book, chapterId: chapter };
  }
  // Old path: /commentary/john
  return { edition: "brief", bookId: edition, chapterId: book, legacyBook: edition };
}

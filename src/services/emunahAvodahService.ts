import { getBookById } from "@/data/books";

/** Official Emunah Avodah study site (Easter Tech). Content is not bundled in NJC. */
export const EMUNAH_AVODAH_HOME = "https://www.emunahavodah.com/";
export const EMUNAH_AVODAH_HOT = "https://www.emunahavodah.com/hot/";
export const EMUNAH_AVODAH_GNT = "https://www.emunahavodah.com/gnt/";
export const EMUNAH_AVODAH_PARASHAH = "https://www.emunahavodah.com/parashah/";

/** Slug segment in emunahavodah.com URLs (not always identical to NJC book ids). */
const BOOK_SLUG: Record<string, string> = {
  psalms: "psalm",
};

/** NT books that open at book level (no chapter segment on EA). */
const BOOK_ONLY_PATHS = new Set(["philemon", "2-john", "3-john", "jude"]);

export function emunahBookSlug(bookId: string): string {
  return BOOK_SLUG[bookId] ?? bookId;
}

export function emunahInterlinearUrl(bookId: string, chapter: number): string | null {
  const book = getBookById(bookId);
  if (!book) return null;
  const slug = emunahBookSlug(bookId);
  const base = book.testament === "OT" ? EMUNAH_AVODAH_HOT : EMUNAH_AVODAH_GNT;
  if (BOOK_ONLY_PATHS.has(bookId)) {
    return `${base}${slug}/`;
  }
  if (chapter < 1 || chapter > book.chapterCount) {
    return `${base}${slug}-1/`;
  }
  return `${base}${slug}-${chapter}/`;
}

export function openEmunahAvodah(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

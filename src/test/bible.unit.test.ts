import { describe, expect, it } from "vitest";
import { parseReference } from "@/utils/referenceParser";
import { parseVerseId, syncKey, verseId } from "@/utils/text";
import { dailyIndex } from "@/services/dailyVerse";
import { formatParallelShare, formatVerseShare } from "@/services/shareService";
import { validateBibleImport } from "@/services/bibleValidation";
import { BOOK_CATALOG } from "@/data/books";
import type { BibleImportFile } from "@/types/bible";

describe("verse IDs", () => {
  it("creates stable translation-scoped ids", () => {
    expect(verseId("kjv", "john", 3, 16)).toBe("kjv:john:3:16");
    expect(verseId("bsi-ov", "john", 3, 16)).toBe("bsi-ov:john:3:16");
    expect(parseVerseId("kjv:john:3:16")).toEqual({
      translationId: "kjv",
      bookId: "john",
      chapter: 3,
      verse: 16,
    });
  });

  it("synchronizes parallel rows by book, chapter, and verse", () => {
    expect(syncKey("john", 3, 16)).toBe("john:3:16");
  });
});

describe("reference parser", () => {
  it("parses English and Tamil references", () => {
    expect(parseReference("John 3:16")?.book.id).toBe("john");
    expect(parseReference("John 3:16")?.verse).toBe(16);
    expect(parseReference("Psalm 23")?.book.id).toBe("psalms");
    expect(parseReference("Romans 8:28")?.chapter).toBe(8);
    expect(parseReference("யோவான் 3:16")?.book.id).toBe("john");
    expect(parseReference("1 John 3:16")?.book.id).toBe("1-john");
  });
});

describe("daily verse", () => {
  it("is deterministic for a date", () => {
    expect(dailyIndex(31102, "2026-09-18", 0)).toBe(dailyIndex(31102, "2026-09-18", 0));
    expect(dailyIndex(31102, "2026-09-18", 0)).not.toBe(dailyIndex(31102, "2026-09-19", 0));
  });
});

describe("share format", () => {
  it("formats single and parallel text", () => {
    expect(formatVerseShare({ bookId: "john", chapter: 3, verse: 16, text: "For God so loved the world...", language: "en" })).toContain("John 3:16");
    expect(formatParallelShare({ bookId: "john", chapter: 3, verse: 16, tamil: "[Licensed Bible text required]", english: "For God so loved the world..." })).toContain("யோவான் 3:16");
  });
});

describe("import validation", () => {
  it("rejects malformed bible data", () => {
    const invalid = { translation: { id: "x" }, books: [] } as unknown as BibleImportFile;
    const result = validateBibleImport(invalid);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("requires 66 books in strict mode", () => {
    const payload: BibleImportFile = {
      translation: { id: "kjv", name: "KJV", language: "en" },
      books: [
        {
          id: "john",
          name: "John",
          chapters: [{ number: 3, verses: [{ number: 16, text: "For God so loved the world..." }] }],
        },
      ],
    };
    expect(validateBibleImport(payload).ok).toBe(false);
    expect(validateBibleImport(payload, { allowPartial: true }).ok).toBe(true);
  });

  it("knows all 66 canonical books", () => {
    expect(BOOK_CATALOG).toHaveLength(66);
  });
});

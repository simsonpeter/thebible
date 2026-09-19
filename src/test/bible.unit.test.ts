import { describe, expect, it } from "vitest";
import { parseReference } from "@/utils/referenceParser";
import { parseVerseId, syncKey, verseId } from "@/utils/text";
import { dailyIndex } from "@/services/dailyVerse";
import { formatParallelShare, formatVerseShare } from "@/services/shareService";
import { validateBibleImport } from "@/services/bibleValidation";
import { BOOK_CATALOG, bookDisplayName } from "@/data/books";
import { buildPlanDays, parseNjcReference } from "@/data/readingPlans";
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

describe("NJC reading plan", () => {
  it("parses morning and evening abbreviations", () => {
    expect(parseNjcReference("Mat.1", "morning")).toEqual([{ bookId: "matthew", chapter: 1, slot: "morning" }]);
    expect(parseNjcReference("Gen.1-3", "evening").map((item) => item.chapter)).toEqual([1, 2, 3]);
    expect(parseNjcReference("Mat.5:1-26", "morning")[0]).toMatchObject({
      bookId: "matthew",
      chapter: 5,
      verseStart: 1,
      verseEnd: 26,
    });
  });

  it("builds 365 complete NJC days", () => {
    const days = buildPlanDays("njc-plan");
    expect(days).toHaveLength(365);
    expect(days[0]?.[0]?.bookId).toBe("matthew");
    expect(days[364]?.some((item) => item.bookId === "malachi")).toBe(true);
    expect(days.every((day) => day.length > 0)).toBe(true);
  });
});

describe("book display names", () => {
  it("uses English names for English and Tamil names for Tamil", () => {
    expect(bookDisplayName("john", "en")).toBe("John");
    expect(bookDisplayName("john", "ta")).toBe("யோவான்");
    expect(bookDisplayName("galatians", "en")).toBe("Galatians");
    expect(bookDisplayName("galatians", "ta")).toBe("கலாத்தியர்");
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

import { describe, expect, it } from "vitest";
import { CROSS_REFERENCE_MAP } from "@/data/crossReferences";
import { getCrossReferences, formatCrossRef } from "@/services/crossReferenceService";
import { tokenizeVerseText } from "@/components/bible/VerseRow";

describe("cross references", () => {
  it("returns curated related verses for John 3:16", () => {
    const refs = getCrossReferences("john", 3, 16);
    expect(refs.length).toBeGreaterThan(0);
    expect(refs.some((item) => item.bookId === "romans" && item.chapter === 5 && item.verse === 8)).toBe(true);
    expect(formatCrossRef(refs[0]!, "en")).toMatch(/\d+:\d+/);
  });

  it("returns empty for unmapped verses", () => {
    expect(getCrossReferences("obadiah", 1, 1)).toEqual([]);
  });

  it("has a useful offline map size", () => {
    expect(Object.keys(CROSS_REFERENCE_MAP).length).toBeGreaterThan(80);
  });
});

describe("verse tokenization", () => {
  it("keeps Tamil and English words separate from punctuation", () => {
    expect(tokenizeVerseText("For God so loved.")).toEqual([
      { kind: "word", value: "For" },
      { kind: "gap", value: " " },
      { kind: "word", value: "God" },
      { kind: "gap", value: " " },
      { kind: "word", value: "so" },
      { kind: "gap", value: " " },
      { kind: "word", value: "loved" },
      { kind: "gap", value: "." },
    ]);
    expect(tokenizeVerseText("தேவன் உலகத்தில்").some((item) => item.value === "தேவன்")).toBe(true);
  });
});

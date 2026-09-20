import { describe, expect, it } from "vitest";
import {
  compareStrongIds,
  normalizeStrongId,
  parseStrongNumber,
  searchStrongEntries,
} from "@/services/dictionaryService";
import type { StrongEntry } from "@/types/strongs";

const sample: StrongEntry[] = [
  {
    id: "H430",
    language: "hebrew",
    lexeme: "אֱלֹהִים",
    transliteration: "elohiym",
    pronunciation: "el-o-heem'",
    shortDefinition: "God",
    partOfSpeech: "Noun Masculine",
    tamil: "தேவன், தேவர், தெய்வம்",
    english: "gods in the ordinary sense; the supreme God",
    cognates: ["H433"],
  },
  {
    id: "G26",
    language: "greek",
    lexeme: "ἀγάπη",
    transliteration: "agape",
    pronunciation: "ag-ah'-pay",
    shortDefinition: "Charity",
    partOfSpeech: "Noun Feminine",
    tamil: "அன்பு",
    english: "love, affection or benevolence",
    cognates: ["G25"],
  },
  {
    id: "G2316",
    language: "greek",
    lexeme: "θεός",
    transliteration: "theos",
    pronunciation: "theh'-os",
    shortDefinition: "God",
    partOfSpeech: "Noun Masculine",
    tamil: "தேவன், தெய்வம்",
    english: "a deity; the supreme Divinity",
    cognates: [],
  },
];

describe("Strong's lookup", () => {
  it("normalizes H and G numbers", () => {
    expect(normalizeStrongId("h430")).toBe("H430");
    expect(normalizeStrongId("G 26")).toBe("G26");
    expect(normalizeStrongId("H0430")).toBe("H430");
    expect(normalizeStrongId("தேவன்")).toBeNull();
    expect(parseStrongNumber("430")).toBe(430);
  });

  it("finds exact numbers before word matches", () => {
    expect(searchStrongEntries(sample, "H430").map((item) => item.id)).toEqual(["H430"]);
    expect(searchStrongEntries(sample, "26").map((item) => item.id)).toEqual(["G26"]);
    expect(searchStrongEntries(sample, "தேவன்").map((item) => item.id)).toEqual(["H430", "G2316"]);
    expect(searchStrongEntries(sample, "love", "greek").map((item) => item.id)).toEqual(["G26"]);
  });

  it("orders Hebrew before Greek", () => {
    expect(compareStrongIds("H430", "G26")).toBeLessThan(0);
    expect(compareStrongIds("G26", "G2316")).toBeLessThan(0);
  });
});

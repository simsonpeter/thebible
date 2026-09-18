import { describe, expect, it } from "vitest";
import {
  mergeBibleImports,
  normalizeBiblePayload,
  parseBibleFile,
  parseCsvBible,
  parseTxtBible,
} from "@/lib/BibleImporter";
import { validateBibleImport } from "@/lib/BibleValidator";
import { normalizeForSearch, tokenize, verseId } from "@/utils/text";

const sampleJson = `{
  "translation": "BSI Tamil O.V. SAMPLE DATA ONLY",
  "language": "ta",
  "books": [
    {
      "id": "john",
      "name": "யோவான்",
      "englishName": "John",
      "chapters": [
        {
          "chapter": 3,
          "verses": [
            { "verse": 16, "text": "SAMPLE DATA ONLY தேவன் அன்பு" }
          ]
        }
      ]
    }
  ]
}`;

describe("BibleImporter", () => {
  it("normalizes JSON with translation string and chapter/verse aliases", () => {
    const payload = parseBibleFile("bsi.json", sampleJson);
    expect(payload.translation.id).toBe("bsi-ov");
    expect(payload.translation.isDemo).toBe(true);
    expect(payload.books[0]?.chapters[0]?.verses[0]?.text).toContain("SAMPLE DATA ONLY");
    expect(payload.books[0]?.nameEnglish).toBe("John");
  });

  it("parses CSV and TXT without executing script", () => {
    const csv = parseCsvBible(
      "bookId,chapter,verse,text\njohn,3,16,For God so loved the world",
      { id: "kjv", name: "KJV", language: "en" },
    );
    expect(csv.books[0]?.chapters[0]?.verses[0]?.text).toBe("For God so loved the world");

    const txt = parseTxtBible(
      "#translation: BSI Tamil O.V.\n#language: ta\nJohn 3:16 SAMPLE DATA ONLY தேவன்",
      { id: "bsi-ov", name: "BSI Tamil O.V.", language: "ta" },
    );
    expect(txt.books[0]?.id).toBe("john");
    expect(txt.books[0]?.chapters[0]?.verses[0]?.text).toContain("தேவன்");
  });

  it("rejects unknown books", () => {
    expect(() =>
      normalizeBiblePayload({
        translation: { id: "kjv", name: "KJV", language: "en" },
        books: [{ id: "not-a-book", name: "Nope", chapters: [] }],
      }),
    ).toThrow(/Unknown book/);
  });
});

describe("BibleValidator", () => {
  it("detects duplicate verses", () => {
    const result = validateBibleImport(
      {
        translation: { id: "kjv", name: "KJV", language: "en" },
        books: [
          {
            id: "john",
            name: "John",
            chapters: [
              {
                number: 3,
                verses: [
                  { number: 16, text: "one" },
                  { number: 16, text: "two" },
                ],
              },
            ],
          },
        ],
      },
      { allowPartial: true },
    );
    expect(result.ok).toBe(false);
    expect(result.errors.some((issue) => issue.code === "duplicate-verse")).toBe(true);
  });

  it("warns on missing verses", () => {
    const result = validateBibleImport(
      {
        translation: { id: "kjv", name: "KJV", language: "en" },
        books: [
          {
            id: "john",
            name: "John",
            chapters: [{ number: 3, verses: [{ number: 2, text: "second" }] }],
          },
        ],
      },
      { allowPartial: true },
    );
    expect(result.ok).toBe(true);
    expect(result.warnings.some((issue) => issue.code === "missing-verse")).toBe(true);
  });
});

describe("Tamil Unicode search tokens", () => {
  it("keeps Tamil letters under NFKC and tokenizes them", () => {
    expect(normalizeForSearch("தேவன்")).toBe("தேவன்");
    expect(tokenize("தேவன் அன்பு இரட்சிப்பு", "ta")).toEqual(expect.arrayContaining(["தேவன்", "அன்பு", "இரட்சிப்பு"]));
    expect(verseId("bsi-ov", "genesis", 1, 1)).toBe("bsi-ov:genesis:1:1");
  });
});

describe("aruljohn Tamil JSON", () => {
  const johnBook = {
    book: { english: "John", tamil: "யோவான்" },
    count: "21",
    chapters: [
      {
        chapter: "3",
        verses: [{ verse: "16", text: "தேவன் இவ்வளவாய் உலகத்தில் அன்புகூர்ந்தார்." }],
      },
    ],
  };

  it("imports a single per-book file", () => {
    const payload = parseBibleFile("John.json", JSON.stringify(johnBook));
    expect(payload.translation.id).toBe("bsi-ov");
    expect(payload.books[0]?.id).toBe("john");
    expect(payload.books[0]?.chapters[0]?.verses[0]?.number).toBe(16);
    expect(payload.books[0]?.chapters[0]?.verses[0]?.text).toContain("தேவன்");
  });

  it("rejects Books.json catalog files", () => {
    expect(() =>
      parseBibleFile(
        "Books.json",
        JSON.stringify([{ book: { english: "John", tamil: "யோவான்" } }]),
      ),
    ).toThrow(/catalog only/);
  });

  it("merges multiple per-book files", () => {
    const genesis = parseBibleFile(
      "Genesis.json",
      JSON.stringify({
        book: { english: "Genesis", tamil: "ஆதியாகமம்" },
        chapters: [{ chapter: "1", verses: [{ verse: "1", text: "ஆதியிலே" }] }],
      }),
    );
    const john = parseBibleFile("John.json", JSON.stringify(johnBook));
    const merged = mergeBibleImports([genesis, john]);
    expect(merged.books.map((book) => book.id)).toEqual(["genesis", "john"]);
  });
});

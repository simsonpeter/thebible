import { BOOK_CATALOG, getBookByAlias, getBookById } from "@/data/books";
import type {
  BibleImportFile,
  ImportBook,
  ImportChapter,
  ImportTranslation,
  ImportVerse,
} from "@/types/bible";

interface LooseChapter {
  number?: number;
  chapter?: number;
  verses?: Array<{ number?: number; verse?: number; text?: string }>;
}

interface LooseBook {
  id?: string;
  name?: string;
  nameTamil?: string;
  nameEnglish?: string;
  englishName?: string;
  testament?: ImportBook["testament"];
  chapters?: LooseChapter[];
}

interface LoosePayload {
  translation?: ImportTranslation | string;
  language?: string;
  name?: string;
  id?: string;
  books?: LooseBook[];
}

interface AruljohnBook {
  book?: { english?: string; tamil?: string };
  count?: string | number;
  chapters?: Array<{
    chapter?: string | number;
    verses?: Array<{ verse?: string | number; text?: string }>;
  }>;
}

function isSampleDataset(name: string): boolean {
  return /sample data only/i.test(name);
}

export function tamilOvTranslation(): ImportTranslation {
  return {
    id: "bsi-ov",
    name: "Tamil Bible (Old Version)",
    language: "ta",
    abbreviation: "தமிழ் O.V.",
  };
}

function asTranslation(raw: LoosePayload): ImportTranslation {
  if (typeof raw.translation === "string") {
    const name = raw.translation;
    const tamil = /tamil|bsi|o\.v|ov/i.test(name);
    return {
      id: tamil ? "bsi-ov" : "kjv",
      name,
      language: raw.language === "en" ? "en" : tamil ? "ta" : "ta",
      abbreviation: tamil ? "தமிழ் O.V." : "KJV",
      isDemo: isSampleDataset(name),
    };
  }
  if (raw.translation && typeof raw.translation === "object") {
    return {
      ...raw.translation,
      language: raw.translation.language ?? raw.language ?? "ta",
    };
  }
  return {
    ...tamilOvTranslation(),
    id: raw.id ?? "bsi-ov",
    name: raw.name ?? "Tamil Bible (Old Version)",
    language: raw.language ?? "ta",
  };
}

function isAruljohnBook(value: unknown): value is AruljohnBook {
  if (!value || typeof value !== "object") return false;
  const obj = value as AruljohnBook;
  const name = obj.book?.english?.trim() || obj.book?.tamil?.trim();
  return Boolean(name && Array.isArray(obj.chapters));
}

function isAruljohnCatalog(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const row = item as AruljohnBook;
    return Boolean(row.book && !Array.isArray(row.chapters));
  });
}

function orderBooks(books: ImportBook[]): ImportBook[] {
  const byId = new Map(books.map((book) => [book.id, book]));
  const ordered = BOOK_CATALOG.map((item) => byId.get(item.id)).filter((book): book is ImportBook => Boolean(book));
  for (const book of books) {
    if (!ordered.some((item) => item.id === book.id)) ordered.push(book);
  }
  return ordered;
}

function importBookFromAruljohn(raw: AruljohnBook): ImportBook {
  const english = raw.book?.english?.trim() ?? "";
  const tamil = raw.book?.tamil?.trim() ?? "";
  const catalog = getBookByAlias(english) ?? getBookByAlias(tamil);
  if (!catalog) {
    throw new Error(`Unknown book "${english || tamil}".`);
  }
  return {
    id: catalog.id,
    name: tamil || catalog.nameTamil,
    nameTamil: tamil || catalog.nameTamil,
    nameEnglish: english || catalog.nameEnglish,
    testament: catalog.testament,
    chapters: (raw.chapters ?? []).map((chapter) => ({
      number: Number(chapter.chapter),
      verses: (chapter.verses ?? []).map((verse) => ({
        number: Number(verse.verse),
        text: typeof verse.text === "string" ? verse.text : "",
      })),
    })),
  };
}

function chapterNumber(chapter: LooseChapter): number {
  return Number(chapter.number ?? chapter.chapter);
}

function verseNumber(verse: { number?: number; verse?: number }): number {
  return Number(verse.number ?? verse.verse);
}

export function mergeBibleImports(payloads: BibleImportFile[]): BibleImportFile {
  if (payloads.length === 0) {
    throw new Error("No Bible files to import.");
  }
  const books = new Map<string, ImportBook>();
  for (const payload of payloads) {
    for (const book of payload.books) {
      books.set(book.id, book);
    }
  }
  return {
    translation: (payloads.find((item) => item.books.length > 1) ?? payloads[0]).translation,
    books: orderBooks([...books.values()]),
  };
}

export function normalizeBiblePayload(raw: unknown): BibleImportFile {
  if (isAruljohnCatalog(raw)) {
    throw new Error(
      "Books.json is a catalog only. Import the 66 book files (Genesis.json through Revelation.json).",
    );
  }
  if (isAruljohnBook(raw)) {
    return { translation: tamilOvTranslation(), books: [importBookFromAruljohn(raw)] };
  }
  if (Array.isArray(raw)) {
    if (raw.every(isAruljohnBook)) {
      return { translation: tamilOvTranslation(), books: orderBooks(raw.map(importBookFromAruljohn)) };
    }
    throw new Error("Invalid Bible file. Expected a books array or per-book Tamil JSON.");
  }
  const data = (raw ?? {}) as LoosePayload;
  if (Array.isArray(data.books) && data.books.length > 0 && isAruljohnBook(data.books[0])) {
    return {
      translation: asTranslation(data),
      books: orderBooks((data.books as unknown as AruljohnBook[]).map(importBookFromAruljohn)),
    };
  }
  if (!Array.isArray(data.books)) {
    throw new Error("Invalid Bible file. Expected a books array.");
  }
  const translation = asTranslation(data);
  const books: ImportBook[] = data.books.map((book) => {
    const id = book.id ? getBookById(book.id)?.id : getBookByAlias(book.name ?? "")?.id;
    if (!id) {
      throw new Error(`Unknown book "${book.id ?? book.name ?? ""}".`);
    }
    const catalog = getBookById(id);
    const chapters: ImportChapter[] = (book.chapters ?? []).map((chapter) => ({
      number: chapterNumber(chapter),
      verses: (chapter.verses ?? []).map((verse) => ({
        number: verseNumber(verse),
        text: typeof verse.text === "string" ? verse.text : "",
      })) satisfies ImportVerse[],
    }));
    return {
      id,
      name: book.name ?? catalog?.nameEnglish ?? id,
      nameTamil: book.nameTamil ?? (translation.language === "ta" ? book.name : catalog?.nameTamil),
      nameEnglish: book.nameEnglish ?? book.englishName ?? catalog?.nameEnglish,
      testament: book.testament ?? catalog?.testament,
      chapters,
    };
  });
  return { translation, books };
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      out.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  out.push(current);
  return out;
}

export function parseCsvBible(text: string, fallback: ImportTranslation): BibleImportFile {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim() && !line.startsWith("#"));
  if (lines.length < 2) throw new Error("Invalid Bible file. CSV needs a header and rows.");
  const header = parseCsvLine(lines[0]).map((item) => item.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const bookIdx = idx("bookid") >= 0 ? idx("bookid") : idx("book");
  const chapterIdx = idx("chapter");
  const verseIdx = idx("verse");
  const textIdx = idx("text");
  if (bookIdx < 0 || chapterIdx < 0 || verseIdx < 0 || textIdx < 0) {
    throw new Error("Invalid Bible file. CSV must include bookId, chapter, verse, and text columns.");
  }
  const translationName = idx("translation") >= 0 ? parseCsvLine(lines[1])[idx("translation")] : fallback.name;
  const language = idx("language") >= 0 ? parseCsvLine(lines[1])[idx("language")] : fallback.language;
  const books = new Map<string, ImportBook>();
  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    const bookId = getBookById(cols[bookIdx])?.id ?? getBookByAlias(cols[bookIdx])?.id;
    if (!bookId) throw new Error(`Unknown book "${cols[bookIdx]}".`);
    const catalog = getBookById(bookId);
    if (!catalog) continue;
    const chapter = Number(cols[chapterIdx]);
    const verse = Number(cols[verseIdx]);
    const verseText = cols[textIdx] ?? "";
    let book = books.get(bookId);
    if (!book) {
      book = {
        id: bookId,
        name: catalog.nameTamil,
        nameEnglish: catalog.nameEnglish,
        nameTamil: catalog.nameTamil,
        testament: catalog.testament,
        chapters: [],
      };
      books.set(bookId, book);
    }
    let chapterRow = book.chapters.find((item) => item.number === chapter);
    if (!chapterRow) {
      chapterRow = { number: chapter, verses: [] };
      book.chapters.push(chapterRow);
    }
    chapterRow.verses.push({ number: verse, text: verseText });
  }
  for (const book of books.values()) {
    book.chapters.sort((a, b) => a.number - b.number);
    for (const chapter of book.chapters) chapter.verses.sort((a, b) => a.number - b.number);
  }
  const ordered = BOOK_CATALOG.map((item) => books.get(item.id)).filter((book): book is ImportBook => Boolean(book));
  return {
    translation: {
      ...fallback,
      name: translationName || fallback.name,
      language: language === "en" ? "en" : fallback.language,
    },
    books: ordered,
  };
}

export function parseTxtBible(text: string, fallback: ImportTranslation): BibleImportFile {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  let translation = { ...fallback };
  const books = new Map<string, ImportBook>();
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//")) continue;
    if (line.startsWith("#")) {
      const [key, ...rest] = line.slice(1).split(":");
      const value = rest.join(":").trim();
      if (key.trim() === "translation") translation = { ...translation, name: value, id: /bsi/i.test(value) ? "bsi-ov" : translation.id };
      if (key.trim() === "language") translation = { ...translation, language: value === "en" ? "en" : "ta" };
      if (key.trim() === "id") translation = { ...translation, id: value };
      continue;
    }
    const match = line.match(/^(.+?)\s+(\d+)\s*[.:]\s*(\d+)\s+(.+)$/);
    if (!match) {
      throw new Error(`Invalid Bible file. Could not parse line: ${line.slice(0, 80)}`);
    }
    const book = getBookByAlias(match[1]) ?? getBookById(match[1]);
    if (!book) throw new Error(`Unknown book "${match[1]}".`);
    const chapter = Number(match[2]);
    const verse = Number(match[3]);
    const verseText = match[4];
    let record = books.get(book.id);
    if (!record) {
      record = {
        id: book.id,
        name: translation.language === "ta" ? book.nameTamil : book.nameEnglish,
        nameTamil: book.nameTamil,
        nameEnglish: book.nameEnglish,
        testament: book.testament,
        chapters: [],
      };
      books.set(book.id, record);
    }
    let chapterRow = record.chapters.find((item) => item.number === chapter);
    if (!chapterRow) {
      chapterRow = { number: chapter, verses: [] };
      record.chapters.push(chapterRow);
    }
    chapterRow.verses.push({ number: verse, text: verseText });
  }
  const ordered = BOOK_CATALOG.map((item) => books.get(item.id)).filter((book): book is ImportBook => Boolean(book));
  return { translation, books: ordered };
}

export function parseBibleFile(filename: string, content: string): BibleImportFile {
  const lower = filename.toLowerCase();
  const fallback: ImportTranslation = tamilOvTranslation();
  if (lower.endsWith(".csv")) return parseCsvBible(content, fallback);
  if (lower.endsWith(".txt")) return parseTxtBible(content, fallback);
  try {
    return normalizeBiblePayload(JSON.parse(content));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("Invalid Bible file. JSON could not be parsed.");
    throw error;
  }
}

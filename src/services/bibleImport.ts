import { BOOK_CATALOG, getBookById } from "@/data/books";
import { DEMO_PLACEHOLDER, LICENSES } from "@/data/licenses";
import { db } from "@/db";
import type {
  BibleImportFile,
  BibleLanguage,
  BookRecord,
  ChapterRecord,
  ThiagoKjvBook,
  TranslationMeta,
  VerseRecord,
} from "@/types/bible";
import { nowIso } from "@/utils/misc";
import { cleanSourceVerseText, normalizeForSearch, tokenize, verseId } from "@/utils/text";
import { validateBibleImport } from "@/services/bibleValidation";
import { seedReadingPlans } from "@/services/planService";
import { publicUrl } from "@/utils/publicUrl";

export const DATA_SCHEMA_VERSION = 4;

function isProbablyHtml(text: string): boolean {
  const start = text.trimStart().slice(0, 15).toLowerCase();
  return start.startsWith("<!doctype") || start.startsWith("<html");
}

async function fetchJsonIfPresent(url: string): Promise<BibleImportFile | null> {
  const response = await fetch(url);
  if (!response.ok) return null;
  const text = await response.text();
  if (!text.trim() || isProbablyHtml(text)) return null;
  try {
    return JSON.parse(text) as BibleImportFile;
  } catch {
    return null;
  }
}

export interface ImportProgress {
  stage: string;
  percent: number;
}

function toLanguage(value: string): BibleLanguage {
  return value === "ta" ? "ta" : "en";
}

export function convertKjvSource(source: ThiagoKjvBook[]): BibleImportFile {
  if (!Array.isArray(source) || source.length !== BOOK_CATALOG.length) {
    throw new Error("KJV source must contain exactly 66 books in Protestant canon order.");
  }

  return {
    translation: {
      id: LICENSES.kjv.id,
      name: LICENSES.kjv.name,
      abbreviation: LICENSES.kjv.abbreviation,
      language: "en",
      license: LICENSES.kjv.license,
      licenseDetails: LICENSES.kjv.licenseDetails,
      source: LICENSES.kjv.source,
      year: LICENSES.kjv.year,
      isDemo: false,
    },
    books: source.map((book, index) => {
      const catalog = BOOK_CATALOG[index];
      return {
        id: catalog.id,
        name: catalog.nameEnglish,
        nameEnglish: catalog.nameEnglish,
        nameTamil: catalog.nameTamil,
        testament: catalog.testament,
        chapters: book.chapters.map((verses, chapterIndex) => ({
          number: chapterIndex + 1,
          verses: verses.map((text, verseIndex) => ({
            number: verseIndex + 1,
            text: cleanSourceVerseText(text),
          })),
        })),
      };
    }),
  };
}

const DEMO_CHAPTERS: Record<string, number[]> = {
  genesis: [1],
  psalms: [23],
  john: [3],
  romans: [8],
};

export function buildDemoBsiOv(from: BibleImportFile): BibleImportFile {
  return {
    translation: {
      id: LICENSES.bsiOv.id,
      name: LICENSES.bsiOv.name,
      abbreviation: LICENSES.bsiOv.abbreviation,
      language: "ta",
      license: LICENSES.bsiOv.license,
      licenseDetails: LICENSES.bsiOv.licenseDetails,
      source: LICENSES.bsiOv.source,
      copyrightHolder: LICENSES.bsiOv.copyrightHolder,
      isDemo: true,
    },
    books: from.books
      .filter((book) => DEMO_CHAPTERS[book.id])
      .map((book) => {
        const catalog = getBookById(book.id);
        const allowed = new Set(DEMO_CHAPTERS[book.id]);
        return {
          id: book.id,
          name: catalog?.nameTamil ?? book.name,
          nameTamil: catalog?.nameTamil,
          nameEnglish: catalog?.nameEnglish,
          testament: catalog?.testament,
          chapters: book.chapters
            .filter((chapter) => allowed.has(chapter.number))
            .map((chapter) => ({
              number: chapter.number,
              verses: chapter.verses.map((verse) => ({
                number: verse.number,
                text: DEMO_PLACEHOLDER,
              })),
            })),
        };
      }),
  };
}

function recordsFromImport(payload: BibleImportFile): {
  translation: TranslationMeta;
  books: BookRecord[];
  chapters: ChapterRecord[];
  verses: VerseRecord[];
} {
  const language = toLanguage(String(payload.translation.language));
  const translationId = payload.translation.id;
  const books: BookRecord[] = [];
  const chapters: ChapterRecord[] = [];
  const verses: VerseRecord[] = [];

  for (const book of payload.books) {
    const catalog = getBookById(book.id);
    if (!catalog) continue;
    books.push({
      translationId,
      bookId: book.id,
      order: catalog.order,
      testament: catalog.testament,
      name: language === "ta" ? catalog.nameTamil : catalog.nameEnglish,
      nameEnglish: catalog.nameEnglish,
      nameTamil: catalog.nameTamil,
      chapterCount: catalog.chapterCount,
    });
    for (const chapter of book.chapters) {
      chapters.push({
        translationId,
        bookId: book.id,
        number: chapter.number,
        verseCount: chapter.verses.length,
      });
      for (const verse of chapter.verses) {
        const text = verse.text.trim();
        verses.push({
          id: verseId(translationId, book.id, chapter.number, verse.number),
          translationId,
          bookId: book.id,
          chapter: chapter.number,
          number: verse.number,
          text,
          normalizedText: normalizeForSearch(text),
          tokens: tokenize(text, language),
          isPlaceholder: Boolean(payload.translation.isDemo) || text === DEMO_PLACEHOLDER,
        });
      }
    }
  }

  const translation: TranslationMeta = {
    id: translationId,
    name: payload.translation.name,
    abbreviation: payload.translation.abbreviation ?? payload.translation.name,
    language,
    license: payload.translation.license ?? "Unknown",
    licenseDetails: payload.translation.licenseDetails ?? "",
    source: payload.translation.source ?? "Imported file",
    copyrightHolder: payload.translation.copyrightHolder,
    year: payload.translation.year,
    isDemo: Boolean(payload.translation.isDemo),
    installedAt: nowIso(),
    verseCount: verses.length,
    bookCount: books.length,
  };

  return { translation, books, chapters, verses };
}

export async function replaceTranslation(payload: BibleImportFile): Promise<TranslationMeta> {
  const { translation, books, chapters, verses } = recordsFromImport(payload);
  await db.transaction(
    "rw",
    [db.translations, db.books, db.chapters, db.verses],
    async () => {
      await db.verses.where("translationId").equals(translation.id).delete();
      await db.chapters.where("translationId").equals(translation.id).delete();
      await db.books.where("translationId").equals(translation.id).delete();
      await db.translations.delete(translation.id);
      await db.translations.put(translation);
      await db.books.bulkPut(books);
      await db.chapters.bulkPut(chapters);
      const chunkSize = 2500;
      for (let i = 0; i < verses.length; i += chunkSize) {
        await db.verses.bulkPut(verses.slice(i, i + chunkSize));
      }
    },
  );
  return translation;
}

export async function importBiblePayload(
  payload: BibleImportFile,
  options: { allowPartial?: boolean; allowPlaceholders?: boolean } = {},
  onProgress?: (progress: ImportProgress) => void,
): Promise<{ translation: TranslationMeta; warnings: string[] }> {
  onProgress?.({ stage: "Validating…", percent: 25 });
  const result = validateBibleImport(payload, options);
  if (!result.ok) {
    throw new Error(result.errors.map((issue) => issue.message).join("\n"));
  }
  onProgress?.({ stage: "Importing…", percent: 55 });
  const translation = await replaceTranslation(payload);
  onProgress?.({ stage: "Indexing…", percent: 85 });
  onProgress?.({ stage: "Complete.", percent: 100 });
  return {
    translation,
    warnings: result.warnings.map((issue) => issue.message),
  };
}

async function ensureBundledTamil(onProgress?: (progress: ImportProgress) => void): Promise<void> {
  const existing = await db.translations.get("bsi-ov");
  if (existing && !existing.isDemo && existing.verseCount > 0) return;
  const bundled = await fetchJsonIfPresent(publicUrl("bible-data/bsi-ov/bsi-ov.json"));
  if (!bundled) return;
  const check = validateBibleImport(bundled, { allowPartial: true });
  if (!check.ok) return;
  onProgress?.({ stage: "Installing Tamil Bible…", percent: 82 });
  await replaceTranslation(bundled);
}

async function ensureBundledTanglish(onProgress?: (progress: ImportProgress) => void): Promise<void> {
  const existing = await db.translations.get("tanglish");
  if (existing && !existing.isDemo && existing.verseCount > 0) return;
  const bundled = await fetchJsonIfPresent(publicUrl("bible-data/tanglish/tanglish.json"));
  if (!bundled) return;
  const check = validateBibleImport(bundled, { allowPartial: true });
  if (!check.ok) return;
  onProgress?.({ stage: "Installing Tanglish Bible…", percent: 88 });
  await replaceTranslation(bundled);
}

export async function removeDemoTranslation(translationId: string): Promise<void> {
  const translation = await db.translations.get(translationId);
  if (!translation?.isDemo) return;
  await db.transaction("rw", [db.translations, db.books, db.chapters, db.verses], async () => {
    await db.verses.where("translationId").equals(translationId).delete();
    await db.chapters.where("translationId").equals(translationId).delete();
    await db.books.where("translationId").equals(translationId).delete();
    await db.translations.delete(translationId);
  });
}

export async function bootstrapLocalBible(
  onProgress?: (progress: ImportProgress) => void,
): Promise<void> {
  const existing = await db.translations.get("kjv");
  const schema = await db.settings.get("dataSchemaVersion");
  if (existing && schema?.value === DATA_SCHEMA_VERSION) {
    await removeDemoTranslation("bsi-ov");
    await ensureBundledTamil(onProgress);
    await ensureBundledTanglish(onProgress);
    await seedReadingPlans();
    onProgress?.({ stage: "Offline Bible ready", percent: 100 });
    return;
  }

  onProgress?.({ stage: "Reading file…", percent: 8 });
  const kjv = await fetchJsonIfPresent(publicUrl("bible-data/kjv/kjv.json"));
  if (!kjv) {
    throw new Error("No Bible data installed.");
  }
  onProgress?.({ stage: "Validating…", percent: 22 });
  const kjvCheck = validateBibleImport(kjv);
  if (!kjvCheck.ok) {
    throw new Error("Invalid Bible file.");
  }

  onProgress?.({ stage: "Importing…", percent: 40 });
  await replaceTranslation(kjv);

  onProgress?.({ stage: "Indexing…", percent: 78 });
  await ensureBundledTamil(onProgress);
  await ensureBundledTanglish(onProgress);

  onProgress?.({ stage: "Creating reading plans…", percent: 90 });
  await seedReadingPlans();
  await db.settings.put({ key: "dataSchemaVersion", value: DATA_SCHEMA_VERSION });
  onProgress?.({ stage: "Complete.", percent: 100 });
}

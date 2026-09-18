import { BOOK_CATALOG, getBookById } from "@/data/books";
import type { BibleImportFile, ValidationIssue, ValidationResult } from "@/types/bible";

const PLACEHOLDER_RE = /\[Licensed Bible text required\]/i;

export function validateBibleImport(
  payload: BibleImportFile,
  options: { allowPartial?: boolean; allowPlaceholders?: boolean } = {},
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const allowPartial = options.allowPartial ?? false;
  const allowPlaceholders = options.allowPlaceholders ?? Boolean(payload.translation?.isDemo);

  if (!payload || typeof payload !== "object") {
    errors.push({ level: "error", code: "invalid-file", message: "Import file is not a JSON object." });
    return summary(errors, warnings, 0, 0, 0);
  }
  if (!payload.translation?.id || !payload.translation.name || !payload.translation.language) {
    errors.push({
      level: "error",
      code: "missing-translation",
      message: "translation.id, translation.name, and translation.language are required.",
    });
  }
  if (!Array.isArray(payload.books) || payload.books.length === 0) {
    errors.push({ level: "error", code: "no-books", message: "books must be a non-empty array." });
    return summary(errors, warnings, 0, 0, 0);
  }

  if (!allowPartial && payload.books.length !== 66) {
    errors.push({
      level: "error",
      code: "book-count",
      message: `Expected exactly 66 books, received ${payload.books.length}.`,
    });
  } else if (allowPartial && payload.books.length !== 66) {
    warnings.push({
      level: "warning",
      code: "partial-books",
      message: `Partial import contains ${payload.books.length} book(s). Full Bibles must include 66 books.`,
    });
  }

  const seenBookIds = new Set<string>();
  let chapterCount = 0;
  let verseCount = 0;

  for (const book of payload.books) {
    if (!book?.id || !book.name || !Array.isArray(book.chapters)) {
      errors.push({
        level: "error",
        code: "invalid-book",
        message: "Each book needs id, name, and chapters[].",
        bookId: book?.id,
      });
      continue;
    }
    if (seenBookIds.has(book.id)) {
      errors.push({
        level: "error",
        code: "duplicate-book",
        message: `Duplicate book id "${book.id}".`,
        bookId: book.id,
      });
    }
    seenBookIds.add(book.id);

    const catalog = getBookById(book.id);
    if (!catalog) {
      errors.push({
        level: "error",
        code: "unknown-book",
        message: `Unknown book id "${book.id}". Use the canonical 66-book identifiers.`,
        bookId: book.id,
      });
    }

    const seenChapters = new Set<number>();
    for (const chapter of book.chapters) {
      if (!Number.isInteger(chapter?.number) || chapter.number < 1 || !Array.isArray(chapter.verses)) {
        errors.push({
          level: "error",
          code: "invalid-chapter",
          message: "Each chapter needs a positive number and verses[].",
          bookId: book.id,
          chapter: chapter?.number,
        });
        continue;
      }
      if (seenChapters.has(chapter.number)) {
        errors.push({
          level: "error",
          code: "duplicate-chapter",
          message: `Duplicate chapter ${chapter.number}.`,
          bookId: book.id,
          chapter: chapter.number,
        });
      }
      seenChapters.add(chapter.number);
      chapterCount += 1;

      if (catalog && chapter.number > catalog.chapterCount) {
        warnings.push({
          level: "warning",
          code: "unexpected-chapter",
          message: `${book.id} chapter ${chapter.number} exceeds catalog chapter count ${catalog.chapterCount}.`,
          bookId: book.id,
          chapter: chapter.number,
        });
      }

      const seenVerses = new Set<number>();
      for (const verse of chapter.verses) {
        if (!Number.isInteger(verse?.number) || verse.number < 1) {
          errors.push({
            level: "error",
            code: "invalid-verse",
            message: "Verse numbers must be positive integers.",
            bookId: book.id,
            chapter: chapter.number,
            verse: verse?.number,
          });
          continue;
        }
        if (seenVerses.has(verse.number)) {
          errors.push({
            level: "error",
            code: "duplicate-verse",
            message: `Duplicate verse ${book.id} ${chapter.number}:${verse.number}.`,
            bookId: book.id,
            chapter: chapter.number,
            verse: verse.number,
          });
        }
        seenVerses.add(verse.number);
        verseCount += 1;

        if (typeof verse.text !== "string" || !verse.text.trim()) {
          errors.push({
            level: "error",
            code: "empty-verse",
            message: `Empty text at ${book.id} ${chapter.number}:${verse.number}.`,
            bookId: book.id,
            chapter: chapter.number,
            verse: verse.number,
          });
        } else if (PLACEHOLDER_RE.test(verse.text) && !allowPlaceholders) {
          errors.push({
            level: "error",
            code: "placeholder-text",
            message: "Placeholder verses are only allowed in demo imports.",
            bookId: book.id,
            chapter: chapter.number,
            verse: verse.number,
          });
        }
      }

      const verseNumbers = [...seenVerses].sort((a, b) => a - b);
      for (let i = 0; i < verseNumbers.length; i += 1) {
        if (verseNumbers[i] !== i + 1) {
          warnings.push({
            level: "warning",
            code: "missing-verse",
            message: `${book.id} ${chapter.number} may be missing verse ${i + 1}.`,
            bookId: book.id,
            chapter: chapter.number,
            verse: i + 1,
          });
          break;
        }
      }
    }

    if (catalog && seenChapters.size && seenChapters.size !== catalog.chapterCount && !allowPartial) {
      warnings.push({
        level: "warning",
        code: "chapter-count",
        message: `${book.id} has ${seenChapters.size} chapters; catalog expects ${catalog.chapterCount}.`,
        bookId: book.id,
      });
    }
  }

  if (!allowPartial) {
    for (const catalogBook of BOOK_CATALOG) {
      if (!seenBookIds.has(catalogBook.id)) {
        errors.push({
          level: "error",
          code: "missing-book",
          message: `Missing book "${catalogBook.id}".`,
          bookId: catalogBook.id,
        });
      }
    }
  }

  return summary(errors, warnings, payload.books.length, chapterCount, verseCount);
}

function summary(
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  bookCount: number,
  chapterCount: number,
  verseCount: number,
): ValidationResult {
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    bookCount,
    chapterCount,
    verseCount,
  };
}

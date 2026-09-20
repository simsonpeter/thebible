export const TRANSLATION_IDS = {
  KJV: "kjv",
  BSI_OV: "bsi-ov",
  TANGLISH: "tanglish",
  THNGV: "thngv",
  SV: "sv",
} as const;

export type TranslationId = (typeof TRANSLATION_IDS)[keyof typeof TRANSLATION_IDS];

export type BibleLanguage = "en" | "ta";
export type Testament = "OT" | "NT";

export interface TranslationMeta {
  id: string;
  name: string;
  abbreviation: string;
  language: BibleLanguage;
  license: string;
  licenseDetails: string;
  source: string;
  copyrightHolder?: string;
  year?: number;
  isDemo: boolean;
  installedAt: string;
  verseCount: number;
  bookCount: number;
}

export interface BookDefinition {
  id: string;
  order: number;
  testament: Testament;
  nameEnglish: string;
  nameTamil: string;
  chapterCount: number;
  aliases: string[];
}

export interface BookRecord {
  translationId: string;
  bookId: string;
  order: number;
  testament: Testament;
  name: string;
  nameEnglish: string;
  nameTamil: string;
  chapterCount: number;
}

export interface ChapterRecord {
  translationId: string;
  bookId: string;
  number: number;
  verseCount: number;
}

export interface VerseRecord {
  id: string;
  translationId: string;
  bookId: string;
  chapter: number;
  number: number;
  text: string;
  normalizedText: string;
  tokens: string[];
  isPlaceholder: boolean;
}

export interface ImportTranslation {
  id: string;
  name: string;
  language: BibleLanguage | string;
  abbreviation?: string;
  license?: string;
  licenseDetails?: string;
  source?: string;
  copyrightHolder?: string;
  year?: number;
  isDemo?: boolean;
}

export interface ImportVerse {
  number: number;
  text: string;
}

export interface ImportChapter {
  number: number;
  verses: ImportVerse[];
}

export interface ImportBook {
  id: string;
  name: string;
  nameTamil?: string;
  nameEnglish?: string;
  testament?: Testament;
  chapters: ImportChapter[];
}

export interface BibleImportFile {
  translation: ImportTranslation;
  books: ImportBook[];
}

export interface ValidationIssue {
  level: "error" | "warning";
  code: string;
  message: string;
  bookId?: string;
  chapter?: number;
  verse?: number;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  bookCount: number;
  chapterCount: number;
  verseCount: number;
}

export type ThiagoKjvBook = {
  abbrev: string;
  chapters: string[][];
};

import type { TranslationId } from "./bible";

export type ThemeMode = "light" | "dark" | "system";
export type ReadingMode = "single" | "parallel";
export type ParallelOrder = "tamil-first" | "english-first";
export type FontPreset = "small" | "medium" | "large" | "xl" | "elder";
export type FontFamilyChoice = "sans" | "serif";

export interface SundayPin {
  bookId: string;
  chapter: number;
  verse?: number;
  label?: string;
}

export interface AppSettings {
  theme: ThemeMode;
  /** Gold-on-navy evening reading look. */
  liturgyMode: boolean;
  defaultTranslation: TranslationId;
  readingMode: ReadingMode;
  parallelOrder: ParallelOrder;
  parallelTranslations: string[];
  showVerseNumbers: boolean;
  fontPreset: FontPreset;
  tamilFontSize: number;
  englishFontSize: number;
  lineHeight: number;
  verseSpacing: number;
  tamilFont: FontFamilyChoice;
  englishFont: FontFamilyChoice;
  continuousReading: boolean;
  verseByVerse: boolean;
  distractionFree: boolean;
  rememberPosition: boolean;
  wakeLock: boolean;
  ttsRate: number;
  ttsAutoNextChapter: boolean;
  /** Prefer shorter sleep when liturgy mode starts Listen. */
  liturgySleepMinutes: number;
  lastBookId: string;
  lastChapter: number;
  lastVerse: number;
  lastScrollY: number;
  dailyVerseSalt: number;
  uiLanguage: "en" | "ta";
  highContrast: boolean;
  lastCommentaryPath: string;
  sundayPin: SundayPin | null;
  onboardingDone: boolean;
  showKidsPromise: boolean;
  rememberedFinishedBooks: string[];
}

export const FONT_PRESETS: Record<
  FontPreset,
  { tamilFontSize: number; englishFontSize: number; lineHeight: number; verseSpacing: number }
> = {
  small: { tamilFontSize: 17, englishFontSize: 16, lineHeight: 1.55, verseSpacing: 10 },
  medium: { tamilFontSize: 19, englishFontSize: 18, lineHeight: 1.7, verseSpacing: 14 },
  large: { tamilFontSize: 22, englishFontSize: 20, lineHeight: 1.8, verseSpacing: 18 },
  xl: { tamilFontSize: 26, englishFontSize: 24, lineHeight: 1.9, verseSpacing: 22 },
  elder: { tamilFontSize: 30, englishFontSize: 28, lineHeight: 2, verseSpacing: 24 },
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  liturgyMode: false,
  defaultTranslation: "kjv",
  readingMode: "single",
  parallelOrder: "tamil-first",
  parallelTranslations: ["bsi-ov", "tanglish", "kjv"],
  showVerseNumbers: true,
  fontPreset: "medium",
  tamilFontSize: 19,
  englishFontSize: 18,
  lineHeight: 1.7,
  verseSpacing: 14,
  tamilFont: "sans",
  englishFont: "sans",
  continuousReading: true,
  verseByVerse: true,
  distractionFree: false,
  rememberPosition: true,
  wakeLock: false,
  ttsRate: 1,
  ttsAutoNextChapter: true,
  liturgySleepMinutes: 30,
  lastBookId: "john",
  lastChapter: 3,
  lastVerse: 1,
  lastScrollY: 0,
  dailyVerseSalt: 0,
  uiLanguage: "en",
  highContrast: false,
  lastCommentaryPath: "",
  sundayPin: { bookId: "john", chapter: 3, verse: 16, label: "This Sunday" },
  onboardingDone: false,
  showKidsPromise: true,
  rememberedFinishedBooks: [],
};

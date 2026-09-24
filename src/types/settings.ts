import type { TranslationId } from "./bible";

export type ThemeMode = "light" | "dark" | "system";
export type ReadingMode = "single" | "parallel";
export type ParallelOrder = "tamil-first" | "english-first";
export type FontPreset = "small" | "medium" | "large" | "xl";
export type FontFamilyChoice = "sans" | "serif";

export interface AppSettings {
  theme: ThemeMode;
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
  /** Web Speech playback rate (roughly 0.6–1.5). */
  ttsRate: number;
  lastBookId: string;
  lastChapter: number;
  lastVerse: number;
  lastScrollY: number;
  dailyVerseSalt: number;
  uiLanguage: "en" | "ta";
  highContrast: boolean;
}

export const FONT_PRESETS: Record<
  FontPreset,
  { tamilFontSize: number; englishFontSize: number; lineHeight: number; verseSpacing: number }
> = {
  small: { tamilFontSize: 17, englishFontSize: 16, lineHeight: 1.55, verseSpacing: 10 },
  medium: { tamilFontSize: 19, englishFontSize: 18, lineHeight: 1.7, verseSpacing: 14 },
  large: { tamilFontSize: 22, englishFontSize: 20, lineHeight: 1.8, verseSpacing: 18 },
  xl: { tamilFontSize: 26, englishFontSize: 24, lineHeight: 1.9, verseSpacing: 22 },
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  defaultTranslation: "kjv",
  readingMode: "single",
  parallelOrder: "tamil-first",
  parallelTranslations: ["bsi-ov", "kjv"],
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
  lastBookId: "john",
  lastChapter: 3,
  lastVerse: 1,
  lastScrollY: 0,
  dailyVerseSalt: 0,
  uiLanguage: "en",
  highContrast: false,
};

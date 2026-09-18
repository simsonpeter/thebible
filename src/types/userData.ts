export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "orange";

export type BookmarkCategory = string;

export const DEFAULT_BOOKMARK_CATEGORIES = ["Favorites", "Prayer", "Important", "Study"] as const;

export interface BookmarkRecord {
  id?: number;
  translationId: string;
  bookId: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  title: string;
  category: BookmarkCategory;
  createdAt: string;
  updatedAt: string;
}

export interface HighlightRecord {
  verseId: string;
  translationId: string;
  bookId: string;
  chapter: number;
  verseNumber: number;
  color: HighlightColor;
  createdAt: string;
}

export interface NoteRecord {
  id?: number;
  translationId: string;
  bookId: string;
  chapter: number;
  verseNumber: number;
  verseId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingHistoryRecord {
  id?: number;
  translationId: string;
  bookId: string;
  chapter: number;
  openedAt: string;
}

export interface ReadingProgressRecord {
  bookId: string;
  chapter: number;
  readAt: string;
}

export interface ReadingPlanRecord {
  id: string;
  name: string;
  description: string;
  totalDays: number;
}

export interface PlanDayRecord {
  planId: string;
  day: number;
  label: string;
  readings: Array<{ bookId: string; chapter: number }>;
  completed: boolean;
  completedAt?: string;
}

export interface UserBackupV1 {
  version: 1;
  app: "NJC Bible App";
  exportedAt: string;
  bookmarks: BookmarkRecord[];
  highlights: HighlightRecord[];
  notes: NoteRecord[];
  readingHistory: ReadingHistoryRecord[];
  readingProgress: ReadingProgressRecord[];
  planDays: PlanDayRecord[];
  readingPlans?: ReadingPlanRecord[];
  settings: unknown;
}

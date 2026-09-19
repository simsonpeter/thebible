import Dexie, { type EntityTable } from "dexie";
import type {
  BookRecord,
  ChapterRecord,
  TranslationMeta,
  VerseRecord,
} from "@/types/bible";
import type {
  BookmarkRecord,
  HighlightRecord,
  NoteRecord,
  PlanDayRecord,
  ReadingHistoryRecord,
  ReadingPlanRecord,
  ReadingProgressRecord,
  SermonPassageRecord,
  SermonRecord,
} from "@/types/userData";

export interface SettingsRow {
  key: string;
  value: unknown;
}

export interface RecentSearchRecord {
  id?: number;
  query: string;
  createdAt: string;
}

export interface DownloadRecord {
  id?: number;
  filename: string;
  kind: string;
  createdAt: string;
}

export interface QuizProgressRecord {
  id: string;
  value: unknown;
}

export interface QuizResultRecord {
  id?: number;
  mode: string;
  correct: number;
  total: number;
  completedAt: string;
}

export interface AchievementRecord {
  id: string;
  unlockedAt?: string;
}

export class NJCBibleDB extends Dexie {
  translations!: EntityTable<TranslationMeta, "id">;
  books!: EntityTable<BookRecord, "bookId">;
  chapters!: EntityTable<ChapterRecord, "number">;
  verses!: EntityTable<VerseRecord, "id">;
  bookmarks!: EntityTable<BookmarkRecord, "id">;
  highlights!: EntityTable<HighlightRecord, "verseId">;
  notes!: EntityTable<NoteRecord, "id">;
  sermons!: EntityTable<SermonRecord, "id">;
  sermonPassages!: EntityTable<SermonPassageRecord, "id">;
  readingHistory!: EntityTable<ReadingHistoryRecord, "id">;
  readingPlans!: EntityTable<ReadingPlanRecord, "id">;
  planDays!: EntityTable<PlanDayRecord, "day">;
  readingProgress!: EntityTable<ReadingProgressRecord, "chapter">;
  settings!: EntityTable<SettingsRow, "key">;
  recentSearches!: EntityTable<RecentSearchRecord, "id">;
  downloads!: EntityTable<DownloadRecord, "id">;
  quizProgress!: EntityTable<QuizProgressRecord, "id">;
  quizResults!: EntityTable<QuizResultRecord, "id">;
  achievements!: EntityTable<AchievementRecord, "id">;

  constructor() {
    super("NJCBibleDB");
    this.version(1).stores({
      translations: "id, language, abbreviation, isDemo",
      books: "[translationId+bookId], translationId, bookId, order, testament",
      chapters: "[translationId+bookId+number], translationId, bookId",
      verses:
        "id, translationId, bookId, [translationId+bookId+chapter], [translationId+bookId+chapter+number], *tokens, isPlaceholder",
      bookmarks: "++id, translationId, bookId, category, createdAt",
      highlights: "verseId, translationId, bookId, color, createdAt",
      notes: "++id, verseId, translationId, bookId, updatedAt",
      readingHistory: "++id, openedAt, bookId, [bookId+chapter]",
      readingPlans: "id",
      planDays: "[planId+day], planId, completed",
      readingProgress: "[bookId+chapter], bookId, readAt",
      settings: "key",
      recentSearches: "++id, query, createdAt",
      downloads: "++id, kind, createdAt",
      quizProgress: "id",
      quizResults: "++id, completedAt",
      achievements: "id, unlockedAt",
    });
    this.version(2).stores({
      sermons: "++id, sundayDate, updatedAt, title",
      sermonPassages: "++id, sermonId, order, verseId",
    });
  }
}

export const db = new NJCBibleDB();
export const bibleBooks = db.books;
export const bibleVerses = db.verses;

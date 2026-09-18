/**
 * Future Tamil Bible Quiz architecture.
 *
 * Version 1 does not ship online leaderboards, XP, or battles.
 * Local quiz content can later read from the same IndexedDB verse store.
 */
export type QuizMode = "daily" | "quick" | "battle";

export interface QuizQuestion {
  id: string;
  prompt: string;
  promptLanguage: "ta" | "en";
  options: string[];
  answerIndex: number;
  reference: { bookId: string; chapter: number; verse: number };
}

export interface QuizResult {
  mode: QuizMode;
  correct: number;
  total: number;
  completedAt: string;
}

export interface QuizAdapter {
  getDailyQuiz(dateKey: string): Promise<QuizQuestion[]>;
  submitLocalResult(result: QuizResult): Promise<void>;
}

export const quizComingSoon = {
  daily: "Daily Quiz is coming later.",
  quick: "Quick Quiz is coming later.",
  battle: "Bible Battle is coming later.",
  leaderboard: "Global leaderboards are not part of version 1.",
};

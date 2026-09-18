export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  reference: { bookId: string; chapter: number; verse: number };
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

export interface QuizResult {
  mode: "daily" | "quick" | "battle";
  correct: number;
  total: number;
  xp: number;
  completedAt: string;
}

export const QUIZ_DISABLED = true;

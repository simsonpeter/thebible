import { QUIZ_DISABLED, type QuizQuestion } from "./types";

export function scoreQuiz(questions: QuizQuestion[], answers: number[]): { correct: number; total: number } {
  const total = questions.length;
  const correct = questions.reduce((sum, question, index) => sum + (answers[index] === question.correctAnswer ? 1 : 0), 0);
  return { correct, total };
}

export function quizUnavailableMessage(): string {
  return QUIZ_DISABLED
    ? "Tamil Bible Quiz is coming later. Daily Quiz, XP, and leaderboards are not enabled in this version."
    : "";
}

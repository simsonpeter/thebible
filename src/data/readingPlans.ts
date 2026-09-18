import { getBookById, ntBooks, BOOK_CATALOG } from "@/data/books";

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "nt-90",
    name: "New Testament in 90 Days",
    description: "The New Testament at a steady chapter pace.",
  },
  {
    id: "bible-1-year",
    name: "Read the Bible in 365 Days",
    description: "The whole Protestant canon across 365 days.",
  },
  {
    id: "psalms-30",
    name: "Psalms in 30 Days",
    description: "Five psalms each day.",
  },
  {
    id: "proverbs-31",
    name: "Proverbs in 31 Days",
    description: "One chapter of Proverbs a day.",
  },
  {
    id: "gospels-30",
    name: "Gospels in 30 Days",
    description: "Matthew, Mark, Luke, and John in a month.",
  },
];

export interface PlanReading {
  bookId: string;
  chapter: number;
}

function expandBooks(bookIds: string[]): PlanReading[] {
  const readings: PlanReading[] = [];
  for (const bookId of bookIds) {
    const book = getBookById(bookId);
    if (!book) continue;
    for (let chapter = 1; chapter <= book.chapterCount; chapter += 1) {
      readings.push({ bookId, chapter });
    }
  }
  return readings;
}

function chunkReadings(readings: PlanReading[], days: number): PlanReading[][] {
  const chunks: PlanReading[][] = Array.from({ length: days }, () => []);
  const base = Math.floor(readings.length / days);
  let extra = readings.length % days;
  let index = 0;
  for (let day = 0; day < days; day += 1) {
    const take = base + (extra > 0 ? 1 : 0);
    extra -= extra > 0 ? 1 : 0;
    chunks[day] = readings.slice(index, index + take);
    index += take;
  }
  return chunks.filter((chunk) => chunk.length > 0);
}

export function buildPlanDays(planId: string): PlanReading[][] {
  if (planId === "nt") {
    return chunkReadings(expandBooks(ntBooks().map((book) => book.id)), 260);
  }
  if (planId === "nt-90") {
    return chunkReadings(expandBooks(ntBooks().map((book) => book.id)), 90);
  }
  if (planId === "bible-1-year") {
    return chunkReadings(
      expandBooks(BOOK_CATALOG.map((book) => book.id)),
      365,
    );
  }
  if (planId === "psalms-30") {
    return chunkReadings(expandBooks(["psalms"]), 30);
  }
  if (planId === "proverbs-31") {
    return chunkReadings(expandBooks(["proverbs"]), 31);
  }
  if (planId === "gospels-30") {
    return chunkReadings(expandBooks(["matthew", "mark", "luke", "john"]), 30);
  }
  return [];
}

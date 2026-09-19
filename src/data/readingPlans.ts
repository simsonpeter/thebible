import { BOOK_CATALOG, bookDisplayName, getBookByAlias, getBookById, ntBooks } from "@/data/books";
import njcPlanSource from "@/data/njcplan.json";

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "njc-plan",
    name: "NJC Bible Reading Plan",
    description: "The NJC morning and evening plan from the NJC app: New Testament in the morning and Old Testament in the evening, in 365 days.",
  },
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
  verseStart?: number;
  verseEnd?: number;
  slot?: "morning" | "evening";
}

interface NjcPlanFile {
  readingPlan: Array<{ morning: string[]; evening: string[] }>;
}

const njcPlan = njcPlanSource as NjcPlanFile;

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

export function parseNjcReference(ref: string, slot?: PlanReading["slot"]): PlanReading[] {
  const match = ref.trim().match(/^(.+?)\.(\d+)(?:-(\d+))?(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) {
    throw new Error(`Unknown NJC reading "${ref}".`);
  }
  const book = getBookByAlias(match[1].replace(/\.$/, "").trim());
  if (!book) {
    throw new Error(`Unknown NJC book "${match[1]}" in "${ref}".`);
  }
  const startChapter = Number(match[2]);
  const verseStart = match[4] ? Number(match[4]) : undefined;
  const verseEnd = match[5] ? Number(match[5]) : verseStart;
  const endChapter = !verseStart && match[3] ? Number(match[3]) : startChapter;
  const readings: PlanReading[] = [];
  for (let chapter = startChapter; chapter <= endChapter; chapter += 1) {
    readings.push({
      bookId: book.id,
      chapter,
      verseStart: chapter === startChapter ? verseStart : undefined,
      verseEnd: chapter === endChapter ? verseEnd : undefined,
      slot,
    });
  }
  return readings;
}

export function formatPlanReading(reading: PlanReading, language: "en" | "ta" = "en"): string {
  const name = bookDisplayName(reading.bookId, language);
  if (reading.verseStart && reading.verseEnd && reading.verseStart !== reading.verseEnd) {
    return `${name} ${reading.chapter}:${reading.verseStart}-${reading.verseEnd}`;
  }
  if (reading.verseStart) {
    return `${name} ${reading.chapter}:${reading.verseStart}`;
  }
  return `${name} ${reading.chapter}`;
}

function buildNjcPlanDays(): PlanReading[][] {
  return njcPlan.readingPlan.map((day) => [
    ...day.morning.flatMap((ref) => parseNjcReference(ref, "morning")),
    ...day.evening.flatMap((ref) => parseNjcReference(ref, "evening")),
  ]);
}

export function buildPlanDays(planId: string): PlanReading[][] {
  if (planId === "njc-plan") {
    return buildNjcPlanDays();
  }
  if (planId === "nt") {
    return chunkReadings(expandBooks(ntBooks().map((book) => book.id)), 260);
  }
  if (planId === "nt-90") {
    return chunkReadings(expandBooks(ntBooks().map((book) => book.id)), 90);
  }
  if (planId === "bible-1-year") {
    return chunkReadings(expandBooks(BOOK_CATALOG.map((book) => book.id)), 365);
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

export function labelPlanDay(readings: PlanReading[], language: "en" | "ta" = "en"): string {
  const morning = readings.filter((item) => item.slot === "morning").map((item) => formatPlanReading(item, language));
  const evening = readings.filter((item) => item.slot === "evening").map((item) => formatPlanReading(item, language));
  if (morning.length || evening.length) {
    return [
      morning.length ? `Morning: ${morning.join("; ")}` : "",
      evening.length ? `Evening: ${evening.join("; ")}` : "",
    ]
      .filter(Boolean)
      .join(" • ");
  }
  return readings.map((item) => formatPlanReading(item, language)).join("; ");
}

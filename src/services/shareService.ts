import { translationLabel, translationUiLanguage } from "@/config/translations";
import { formatRange, formatReference } from "@/utils/reference";

export type CopyFormat = "full" | "reference" | "plain" | "pair";

export const COPY_FORMAT_OPTIONS: Array<{ id: CopyFormat; label: string; hint: string }> = [
  { id: "full", label: "Full", hint: "Reference + text with verse numbers" },
  { id: "reference", label: "Reference only", hint: "Just the citation" },
  { id: "plain", label: "Without numbers", hint: "Reference + text, no verse numbers" },
  { id: "pair", label: "Tamil + English", hint: "Both languages together" },
];

export function formatVerseShare(options: {
  bookId: string;
  chapter: number;
  verse: number;
  verseEnd?: number;
  text: string;
  language: "en" | "ta";
}): string {
  const reference =
    options.verseEnd && options.verseEnd !== options.verse
      ? formatRange(options.bookId, options.chapter, options.verse, options.verseEnd, options.language)
      : formatReference(options.bookId, options.chapter, options.verse, options.language);
  return `${reference}\n${options.text}\n\nNJC Bible App`;
}

export function formatParallelShare(options: {
  bookId: string;
  chapter: number;
  verse: number;
  tamil?: string;
  english?: string;
  columns?: Array<{ id: string; text?: string }>;
}): string {
  const columns = parallelColumns(options);
  const lines: string[] = [];
  for (const column of columns) {
    if (!column.text) continue;
    lines.push(formatReference(options.bookId, options.chapter, options.verse, translationUiLanguage(column.id)));
    lines.push(`${translationLabel(column.id)}\n${column.text}`, "");
  }
  lines.push("NJC Bible App");
  return lines.join("\n").trim();
}

export function formatVersesShare(options: {
  bookId: string;
  chapter: number;
  verses: Array<{ number: number; text: string }>;
  language: "en" | "ta";
}): string {
  if (options.verses.length === 1) {
    return formatVerseShare({
      bookId: options.bookId,
      chapter: options.chapter,
      verse: options.verses[0]!.number,
      text: options.verses[0]!.text,
      language: options.language,
    });
  }
  const start = options.verses[0]?.number ?? 1;
  const end = options.verses[options.verses.length - 1]?.number ?? start;
  const body = options.verses.map((verse) => `${verse.number} ${verse.text}`).join("\n");
  return `${formatRange(options.bookId, options.chapter, start, end, options.language)}\n${body}\n\nNJC Bible App`;
}

/** Reference only (no verse body). */
export function formatReferenceOnly(options: {
  bookId: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  language: "en" | "ta";
}): string {
  return formatRange(options.bookId, options.chapter, options.verseStart, options.verseEnd, options.language);
}

/** Reference + text without leading verse numbers. */
export function formatVersesPlain(options: {
  bookId: string;
  chapter: number;
  verses: Array<{ number: number; text: string }>;
  language: "en" | "ta";
}): string {
  if (!options.verses.length) return "";
  const start = options.verses[0]!.number;
  const end = options.verses[options.verses.length - 1]!.number;
  const reference = formatRange(options.bookId, options.chapter, start, end, options.language);
  const body = options.verses.map((verse) => verse.text).join(" ");
  return `${reference}\n${body}\n\nNJC Bible App`;
}

export function formatPairShare(options: {
  bookId: string;
  chapter: number;
  verses: Array<{
    number: number;
    tamil?: string;
    english?: string;
  }>;
}): string {
  if (!options.verses.length) return "";
  const start = options.verses[0]!.number;
  const end = options.verses[options.verses.length - 1]!.number;
  const lines: string[] = [
    formatRange(options.bookId, options.chapter, start, end, "ta"),
    formatRange(options.bookId, options.chapter, start, end, "en"),
    "",
  ];
  for (const verse of options.verses) {
    lines.push(`${verse.number}`);
    if (verse.tamil) lines.push(`தமிழ்: ${verse.tamil}`);
    if (verse.english) lines.push(`English: ${verse.english}`);
    lines.push("");
  }
  lines.push("NJC Bible App");
  return lines.join("\n").trim();
}

export function formatParallelRangeShare(options: {
  bookId: string;
  chapter: number;
  rows: Array<{ number: number; tamil?: string; english?: string; columns?: Array<{ id: string; text?: string }> }>;
}): string {
  if (options.rows.length === 1) {
    return formatParallelShare({
      bookId: options.bookId,
      chapter: options.chapter,
      verse: options.rows[0]!.number,
      tamil: options.rows[0]!.tamil,
      english: options.rows[0]!.english,
      columns: options.rows[0]!.columns,
    });
  }
  const start = options.rows[0]?.number ?? 1;
  const end = options.rows[options.rows.length - 1]?.number ?? start;
  const ids = parallelColumnIds(options.rows);
  const lines: string[] = [];
  for (const id of ids) {
    const texts = options.rows
      .map((row) => ({ number: row.number, text: columnText(row, id) }))
      .filter((row) => row.text);
    if (!texts.length) continue;
    lines.push(formatRange(options.bookId, options.chapter, start, end, translationUiLanguage(id)));
    lines.push(translationLabel(id));
    for (const row of texts) lines.push(`${row.number} ${row.text}`);
    lines.push("");
  }
  lines.push("NJC Bible App");
  return lines.join("\n").trim();
}

function parallelColumns(options: {
  tamil?: string;
  english?: string;
  columns?: Array<{ id: string; text?: string }>;
}): Array<{ id: string; text?: string }> {
  if (options.columns?.length) return options.columns;
  return [
    { id: "bsi-ov", text: options.tamil },
    { id: "kjv", text: options.english },
  ];
}

function parallelColumnIds(
  rows: Array<{ tamil?: string; english?: string; columns?: Array<{ id: string; text?: string }> }>,
): string[] {
  const first = rows.find((row) => row.columns?.length)?.columns;
  if (first?.length) return first.map((column) => column.id);
  return ["bsi-ov", "kjv"];
}

function columnText(
  row: { tamil?: string; english?: string; columns?: Array<{ id: string; text?: string }> },
  id: string,
): string | undefined {
  if (row.columns?.length) return row.columns.find((column) => column.id === id)?.text;
  if (id === "bsi-ov") return row.tamil;
  if (id === "kjv") return row.english;
  return undefined;
}

export async function shareOrCopy(title: string, text: string): Promise<"shared" | "copied" | "aborted"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "aborted";
    }
  }
  await navigator.clipboard.writeText(text);
  return "copied";
}

export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export async function shareTextFile(
  filename: string,
  text: string,
  title: string,
): Promise<"shared" | "copied" | "aborted"> {
  const file = new File([text], filename, { type: "text/plain" });
  if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "aborted";
    }
  }
  return shareOrCopy(title, text);
}

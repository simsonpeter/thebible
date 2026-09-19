import { formatRange, formatReference } from "@/utils/reference";

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
}): string {
  const ta = formatReference(options.bookId, options.chapter, options.verse, "ta");
  const en = formatReference(options.bookId, options.chapter, options.verse, "en");
  const lines = [ta];
  if (options.tamil) lines.push(options.tamil, "");
  lines.push(en);
  if (options.english) lines.push(options.english);
  lines.push("", "NJC Bible App");
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
      verse: options.verses[0].number,
      text: options.verses[0].text,
      language: options.language,
    });
  }
  const start = options.verses[0]?.number ?? 1;
  const end = options.verses[options.verses.length - 1]?.number ?? start;
  const body = options.verses.map((verse) => `${verse.number} ${verse.text}`).join("\n");
  return `${formatRange(options.bookId, options.chapter, start, end, options.language)}\n${body}\n\nNJC Bible App`;
}

export function formatParallelRangeShare(options: {
  bookId: string;
  chapter: number;
  rows: Array<{ number: number; tamil?: string; english?: string }>;
}): string {
  if (options.rows.length === 1) {
    return formatParallelShare({
      bookId: options.bookId,
      chapter: options.chapter,
      verse: options.rows[0].number,
      tamil: options.rows[0].tamil,
      english: options.rows[0].english,
    });
  }
  const start = options.rows[0]?.number ?? 1;
  const end = options.rows[options.rows.length - 1]?.number ?? start;
  const lines = [formatRange(options.bookId, options.chapter, start, end, "ta")];
  for (const row of options.rows) {
    if (row.tamil) lines.push(`${row.number} ${row.tamil}`);
  }
  lines.push("", formatRange(options.bookId, options.chapter, start, end, "en"));
  for (const row of options.rows) {
    if (row.english) lines.push(`${row.number} ${row.english}`);
  }
  lines.push("", "NJC Bible App");
  return lines.join("\n").trim();
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

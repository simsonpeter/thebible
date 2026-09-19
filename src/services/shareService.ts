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

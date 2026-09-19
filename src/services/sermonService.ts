import { db } from "@/db";
import type { VerseRecord } from "@/types/bible";
import type { SermonPassageRecord, SermonRecord } from "@/types/userData";
import { formatRange } from "@/utils/reference";
import { nowIso, upcomingSundayKey } from "@/utils/misc";

export const ACTIVE_SERMON_STORAGE_KEY = "njc-active-sermon-id";

export async function listSermons(): Promise<SermonRecord[]> {
  return db.sermons.orderBy("sundayDate").reverse().toArray();
}

export async function getSermon(id: number): Promise<SermonRecord | undefined> {
  return db.sermons.get(id);
}

export async function listSermonPassages(sermonId: number): Promise<SermonPassageRecord[]> {
  return db.sermonPassages.where("sermonId").equals(sermonId).sortBy("order");
}

export async function createSermon(input?: { title?: string; sundayDate?: string; body?: string }): Promise<number> {
  const stamp = nowIso();
  const sundayDate = input?.sundayDate ?? upcomingSundayKey();
  const id = await db.sermons.add({
    title: input?.title?.trim() || "Sunday sermon",
    sundayDate,
    body: input?.body ?? "",
    createdAt: stamp,
    updatedAt: stamp,
  });
  if (typeof id !== "number") throw new Error("Could not create sermon.");
  return id;
}

export async function updateSermon(
  id: number,
  patch: Partial<Pick<SermonRecord, "title" | "sundayDate" | "body">>,
): Promise<void> {
  await db.sermons.update(id, { ...patch, updatedAt: nowIso() });
}

export async function deleteSermon(id: number): Promise<void> {
  await db.transaction("rw", [db.sermons, db.sermonPassages], async () => {
    await db.sermonPassages.where("sermonId").equals(id).delete();
    await db.sermons.delete(id);
  });
}

export async function addSermonPassage(
  sermonId: number,
  verse: Pick<VerseRecord, "translationId" | "bookId" | "chapter" | "number" | "id" | "text">,
  note = "",
): Promise<number> {
  const existing = await db.sermonPassages.where("sermonId").equals(sermonId).toArray();
  const duplicate = existing.find((row) => row.verseId === verse.id);
  if (duplicate?.id) return duplicate.id;
  const order = existing.reduce((max, row) => Math.max(max, row.order), -1) + 1;
  const id = await db.sermonPassages.add({
    sermonId,
    order,
    translationId: verse.translationId,
    bookId: verse.bookId,
    chapter: verse.chapter,
    verseStart: verse.number,
    verseEnd: verse.number,
    verseId: verse.id,
    text: verse.text,
    note,
    createdAt: nowIso(),
  });
  await db.sermons.update(sermonId, { updatedAt: nowIso() });
  if (typeof id !== "number") throw new Error("Could not add verse to sermon.");
  return id;
}

export async function addSermonPassageRange(
  sermonId: number,
  verses: Array<Pick<VerseRecord, "translationId" | "bookId" | "chapter" | "number" | "id" | "text">>,
): Promise<number> {
  const sorted = [...verses].sort((left, right) => left.number - right.number);
  if (!sorted.length) throw new Error("No verses to add.");
  if (sorted.length === 1) return addSermonPassage(sermonId, sorted[0]);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const rangeId = `${first.translationId}:${first.bookId}:${first.chapter}:${first.number}-${last.number}`;
  const existing = await db.sermonPassages.where("sermonId").equals(sermonId).toArray();
  const duplicate = existing.find((row) => row.verseId === rangeId);
  if (duplicate?.id) return duplicate.id;
  const order = existing.reduce((max, row) => Math.max(max, row.order), -1) + 1;
  const id = await db.sermonPassages.add({
    sermonId,
    order,
    translationId: first.translationId,
    bookId: first.bookId,
    chapter: first.chapter,
    verseStart: first.number,
    verseEnd: last.number,
    verseId: rangeId,
    text: sorted.map((verse) => `${verse.number} ${verse.text}`).join("\n"),
    note: "",
    createdAt: nowIso(),
  });
  await db.sermons.update(sermonId, { updatedAt: nowIso() });
  if (typeof id !== "number") throw new Error("Could not add verses to sermon.");
  return id;
}

export async function updateSermonPassageNote(id: number, note: string): Promise<void> {
  const row = await db.sermonPassages.get(id);
  await db.sermonPassages.update(id, { note });
  if (row) await db.sermons.update(row.sermonId, { updatedAt: nowIso() });
}

export async function removeSermonPassage(id: number): Promise<void> {
  const row = await db.sermonPassages.get(id);
  if (!row) return;
  await db.sermonPassages.delete(id);
  const remaining = await listSermonPassages(row.sermonId);
  await Promise.all(remaining.map((item, index) => db.sermonPassages.update(item.id!, { order: index })));
  await db.sermons.update(row.sermonId, { updatedAt: nowIso() });
}

export async function moveSermonPassage(id: number, direction: -1 | 1): Promise<void> {
  const row = await db.sermonPassages.get(id);
  if (!row) return;
  const rows = await listSermonPassages(row.sermonId);
  const index = rows.findIndex((item) => item.id === id);
  const swap = rows[index + direction];
  if (!swap?.id || !row.id) return;
  await db.transaction("rw", db.sermonPassages, async () => {
    await db.sermonPassages.update(row.id!, { order: swap.order });
    await db.sermonPassages.update(swap.id!, { order: row.order });
  });
}

export function rememberActiveSermon(id: number | null): void {
  if (typeof sessionStorage === "undefined") return;
  if (id == null) sessionStorage.removeItem(ACTIVE_SERMON_STORAGE_KEY);
  else sessionStorage.setItem(ACTIVE_SERMON_STORAGE_KEY, String(id));
}

export function readActiveSermonId(): number | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(ACTIVE_SERMON_STORAGE_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) ? id : null;
}

export function translationLabel(translationId: string): string {
  return translationId === "bsi-ov" ? "Tamil O.V." : "KJV";
}

export function passageLanguage(translationId: string): "en" | "ta" {
  return translationId === "bsi-ov" ? "ta" : "en";
}

export function formatPassageReference(passage: SermonPassageRecord): string {
  const language = passageLanguage(passage.translationId);
  return formatRange(passage.bookId, passage.chapter, passage.verseStart, passage.verseEnd, language);
}

export function formatSermonDocument(
  sermon: Pick<SermonRecord, "title" | "sundayDate" | "body">,
  passages: SermonPassageRecord[],
): string {
  const lines = [
    sermon.title.trim() || "Sunday sermon",
    sermon.sundayDate,
    "",
  ];
  if (sermon.body.trim()) {
    lines.push("Sermon notes", sermon.body.trim(), "");
  }
  if (passages.length) {
    lines.push("Scriptures", "");
    for (const passage of passages) {
      const reference = formatPassageReference(passage);
      lines.push(`${reference} (${translationLabel(passage.translationId)})`, passage.text.trim());
      if (passage.note.trim()) lines.push(`Note: ${passage.note.trim()}`);
      lines.push("");
    }
  }
  lines.push("NJC Bible App");
  return lines.join("\n").trim();
}

export function sermonFilename(sermon: Pick<SermonRecord, "title" | "sundayDate">, ext = "txt"): string {
  const slug = (sermon.title.trim() || "sunday-sermon")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .toLowerCase() || "sunday-sermon";
  return `${sermon.sundayDate}-${slug}.${ext}`;
}

export function sermonShareTitle(sermon: Pick<SermonRecord, "title" | "sundayDate">): string {
  return `${sermon.title.trim() || "Sunday sermon"} · ${sermon.sundayDate}`;
}

import { db } from "@/db";
import type { NoteRecord } from "@/types/userData";
import { nowIso } from "@/utils/misc";
import { normalizeForSearch } from "@/utils/text";
import { noteSyncKey } from "@/utils/mergeBackup";
import { rememberDeleted } from "@/services/tombstoneService";

export async function listNotes(): Promise<NoteRecord[]> {
  return db.notes.orderBy("updatedAt").reverse().toArray();
}

export async function addNote(input: Omit<NoteRecord, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const stamp = nowIso();
  const id = await db.notes.add({ ...input, createdAt: stamp, updatedAt: stamp });
  if (typeof id !== "number") throw new Error("Could not save note.");
  return id;
}

export async function updateNote(id: number, text: string): Promise<void> {
  await db.notes.update(id, { text, updatedAt: nowIso() });
}

export async function deleteNote(id: number): Promise<void> {
  const note = await db.notes.get(id);
  if (note) {
    await rememberDeleted("notes", noteSyncKey(note));
    await rememberDeleted("notes", note.verseId);
  }
  await db.notes.delete(id);
}

export async function searchNotes(query: string): Promise<NoteRecord[]> {
  const needle = normalizeForSearch(query);
  const rows = await listNotes();
  if (!needle) return rows;
  return rows.filter((note) => normalizeForSearch(note.text).includes(needle));
}

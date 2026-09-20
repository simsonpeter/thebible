import { db } from "@/db";
import type { BookmarkCategory, BookmarkRecord } from "@/types/userData";
import { nowIso } from "@/utils/misc";
import { bookmarkSyncKey } from "@/utils/mergeBackup";
import { rememberDeleted } from "@/services/tombstoneService";

export async function listBookmarks(): Promise<BookmarkRecord[]> {
  const rows = await db.bookmarks.orderBy("createdAt").reverse().toArray();
  return rows;
}

export async function addBookmark(input: Omit<BookmarkRecord, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const stamp = nowIso();
  const id = await db.bookmarks.add({ ...input, createdAt: stamp, updatedAt: stamp });
  if (typeof id !== "number") throw new Error("Could not save bookmark.");
  return id;
}

export async function updateBookmark(
  id: number,
  patch: Partial<Pick<BookmarkRecord, "title" | "category">>,
): Promise<void> {
  await db.bookmarks.update(id, { ...patch, updatedAt: nowIso() });
}

export async function deleteBookmark(id: number): Promise<void> {
  const row = await db.bookmarks.get(id);
  if (row) await rememberDeleted("bookmarks", bookmarkSyncKey(row));
  await db.bookmarks.delete(id);
}

export function defaultBookmarkTitle(category: BookmarkCategory): string {
  return category;
}

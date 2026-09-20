import { db } from "@/db";
import { EMPTY_TOMBSTONES, type SyncTombstones } from "@/types/userData";
import { unique } from "@/utils/misc";

const TOMBSTONE_KEY = "syncTombstones";

export async function loadTombstones(): Promise<SyncTombstones> {
  const row = await db.settings.get(TOMBSTONE_KEY);
  const value = row?.value as SyncTombstones | undefined;
  if (!value || typeof value !== "object") return { ...EMPTY_TOMBSTONES };
  return {
    notes: Array.isArray(value.notes) ? value.notes : [],
    bookmarks: Array.isArray(value.bookmarks) ? value.bookmarks : [],
    highlights: Array.isArray(value.highlights) ? value.highlights : [],
    sermons: Array.isArray(value.sermons) ? value.sermons : [],
  };
}

export async function saveTombstones(tombstones: SyncTombstones): Promise<void> {
  await db.settings.put({ key: TOMBSTONE_KEY, value: tombstones });
}

export async function rememberDeleted(kind: keyof SyncTombstones, key: string): Promise<void> {
  if (!key) return;
  const current = await loadTombstones();
  current[kind] = unique([...current[kind], key]);
  await saveTombstones(current);
}

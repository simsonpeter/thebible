import { db } from "@/db";
import type { UserBackupV1 } from "@/types/userData";
import { EMPTY_TOMBSTONES } from "@/types/userData";
import { DEFAULT_SETTINGS } from "@/types/settings";
import { nowIso } from "@/utils/misc";
import { seedReadingPlans } from "@/services/planService";
import { loadTombstones, saveTombstones } from "@/services/tombstoneService";

export async function exportUserData(): Promise<UserBackupV1> {
  const [
    bookmarks,
    highlights,
    notes,
    readingHistory,
    readingProgress,
    planDays,
    readingPlans,
    sermons,
    sermonPassages,
    settingsRow,
  ] = await Promise.all([
    db.bookmarks.toArray(),
    db.highlights.toArray(),
    db.notes.toArray(),
    db.readingHistory.toArray(),
    db.readingProgress.toArray(),
    db.planDays.toArray(),
    db.readingPlans.toArray(),
    db.sermons.toArray(),
    db.sermonPassages.toArray(),
    db.settings.get("app"),
  ]);

  for (const sermon of sermons) {
    if (sermon.syncId && sermon.id) continue;
    if (!sermon.id) continue;
    const syncId = sermon.syncId || crypto.randomUUID();
    await db.sermons.update(sermon.id, { syncId });
    sermon.syncId = syncId;
  }
  const sermonSyncById = new Map(sermons.filter((row) => row.id && row.syncId).map((row) => [row.id!, row.syncId!]));
  for (const passage of sermonPassages) {
    const syncId = passage.sermonSyncId || sermonSyncById.get(passage.sermonId);
    if (!syncId || !passage.id) continue;
    if (passage.sermonSyncId === syncId) continue;
    await db.sermonPassages.update(passage.id, { sermonSyncId: syncId });
    passage.sermonSyncId = syncId;
  }

  const tombstones = await loadTombstones();

  return {
    version: 1,
    app: "NJC Bible App",
    exportedAt: nowIso(),
    bookmarks,
    highlights,
    notes,
    readingHistory,
    readingProgress,
    planDays,
    readingPlans,
    sermons,
    sermonPassages,
    tombstones,
    settings: settingsRow?.value ?? DEFAULT_SETTINGS,
  };
}

export async function importUserData(payload: UserBackupV1): Promise<void> {
  if (!payload || payload.version !== 1 || payload.app !== "NJC Bible App") {
    throw new Error("This file is not a valid NJC Bible App backup.");
  }
  await db.transaction(
    "rw",
    [
      db.bookmarks,
      db.highlights,
      db.notes,
      db.readingHistory,
      db.readingProgress,
      db.planDays,
      db.readingPlans,
      db.sermons,
      db.sermonPassages,
      db.settings,
    ],
    async () => {
      await db.bookmarks.clear();
      await db.highlights.clear();
      await db.notes.clear();
      await db.readingHistory.clear();
      await db.readingProgress.clear();
      await db.planDays.clear();
      await db.sermons.clear();
      await db.sermonPassages.clear();
      if (payload.readingPlans?.length) {
        await db.readingPlans.clear();
        await db.readingPlans.bulkPut(payload.readingPlans);
      }
      await restoreSermons(payload);
      if (payload.bookmarks.length) {
        await db.bookmarks.bulkAdd(payload.bookmarks.map((row) => {
          const copy = { ...row };
          delete copy.id;
          return copy;
        }));
      }
      if (payload.highlights.length) await db.highlights.bulkPut(payload.highlights);
      if (payload.notes.length) {
        await db.notes.bulkAdd(payload.notes.map((row) => {
          const copy = { ...row };
          delete copy.id;
          return copy;
        }));
      }
      if (payload.readingHistory.length) {
        await db.readingHistory.bulkAdd(payload.readingHistory.map((row) => {
          const copy = { ...row };
          delete copy.id;
          return copy;
        }));
      }
      if (payload.readingProgress.length) await db.readingProgress.bulkPut(payload.readingProgress);
      if (payload.planDays.length) await db.planDays.bulkPut(payload.planDays);
      await db.settings.put({ key: "app", value: payload.settings ?? DEFAULT_SETTINGS });
    },
  );
  await saveTombstones(payload.tombstones ?? EMPTY_TOMBSTONES);
}

async function restoreSermons(payload: UserBackupV1): Promise<void> {
  const sermons = payload.sermons ?? [];
  const passages = payload.sermonPassages ?? [];
  if (!sermons.length && !passages.length) return;
  const idBySync = new Map<string, number>();
  for (const sermon of sermons) {
    const syncId = sermon.syncId || crypto.randomUUID();
    const copy = { ...sermon, syncId };
    delete copy.id;
    const newId = await db.sermons.add(copy);
    if (typeof newId === "number") idBySync.set(syncId, newId);
  }
  for (const passage of passages) {
    const syncId = passage.sermonSyncId || sermons.find((row) => row.id === passage.sermonId)?.syncId;
    const sermonId = syncId ? idBySync.get(syncId) : undefined;
    if (!sermonId) continue;
    const copy = { ...passage, sermonId, sermonSyncId: syncId };
    delete copy.id;
    await db.sermonPassages.add(copy);
  }
}

export async function resetUserData(): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.bookmarks,
      db.highlights,
      db.notes,
      db.readingHistory,
      db.readingProgress,
      db.planDays,
      db.readingPlans,
      db.sermons,
      db.sermonPassages,
      db.settings,
    ],
    async () => {
      await db.bookmarks.clear();
      await db.highlights.clear();
      await db.notes.clear();
      await db.readingHistory.clear();
      await db.readingProgress.clear();
      await db.planDays.clear();
      await db.readingPlans.clear();
      await db.sermons.clear();
      await db.sermonPassages.clear();
      await db.settings.delete("app");
    },
  );
  await seedReadingPlans();
}

export async function storageSummary(): Promise<{
  translations: number;
  verses: number;
  bookmarks: number;
  notes: number;
  sermons: number;
}> {
  const [translations, verses, bookmarks, notes, sermons] = await Promise.all([
    db.translations.count(),
    db.verses.count(),
    db.bookmarks.count(),
    db.notes.count(),
    db.sermons.count(),
  ]);
  return { translations, verses, bookmarks, notes, sermons };
}

export function downloadJson(filename: string, data: unknown): void {
  downloadBlob(filename, new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
}

export function downloadText(filename: string, text: string): void {
  downloadBlob(filename, new Blob([text], { type: "text/plain;charset=utf-8" }));
}

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

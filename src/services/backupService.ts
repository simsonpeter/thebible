import { db } from "@/db";
import type { UserBackupV1 } from "@/types/userData";
import { DEFAULT_SETTINGS } from "@/types/settings";
import { nowIso } from "@/utils/misc";
import { seedReadingPlans } from "@/services/planService";

export async function exportUserData(): Promise<UserBackupV1> {
  const [bookmarks, highlights, notes, readingHistory, readingProgress, planDays, readingPlans, settingsRow] =
    await Promise.all([
      db.bookmarks.toArray(),
      db.highlights.toArray(),
      db.notes.toArray(),
      db.readingHistory.toArray(),
      db.readingProgress.toArray(),
      db.planDays.toArray(),
      db.readingPlans.toArray(),
      db.settings.get("app"),
    ]);

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
      db.settings,
    ],
    async () => {
      await db.bookmarks.clear();
      await db.highlights.clear();
      await db.notes.clear();
      await db.readingHistory.clear();
      await db.readingProgress.clear();
      await db.planDays.clear();
      if (payload.readingPlans?.length) {
        await db.readingPlans.clear();
        await db.readingPlans.bulkPut(payload.readingPlans);
      }
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
      await db.settings.delete("app");
    },
  );
  await seedReadingPlans();
}

export async function storageSummary(): Promise<{ translations: number; verses: number; bookmarks: number; notes: number }> {
  const [translations, verses, bookmarks, notes] = await Promise.all([
    db.translations.count(),
    db.verses.count(),
    db.bookmarks.count(),
    db.notes.count(),
  ]);
  return { translations, verses, bookmarks, notes };
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

import type {
  BookmarkRecord,
  NoteRecord,
  PlanDayRecord,
  ReadingHistoryRecord,
  ReadingPlanRecord,
  ReadingProgressRecord,
  SermonPassageRecord,
  SermonRecord,
  SyncTombstones,
  UserBackupV1,
} from "@/types/userData";
import { EMPTY_TOMBSTONES } from "@/types/userData";
import { nowIso, unique } from "@/utils/misc";

export function bookmarkSyncKey(row: Pick<BookmarkRecord, "translationId" | "bookId" | "chapter" | "verseStart" | "verseEnd" | "category">): string {
  return `${row.translationId}:${row.bookId}:${row.chapter}:${row.verseStart}:${row.verseEnd}:${row.category}`;
}

export function noteSyncKey(row: Pick<NoteRecord, "verseId" | "createdAt">): string {
  return `${row.verseId}:${row.createdAt}`;
}

export function historySyncKey(row: Pick<ReadingHistoryRecord, "translationId" | "bookId" | "chapter">): string {
  return `${row.translationId}:${row.bookId}:${row.chapter}`;
}

export function progressSyncKey(row: Pick<ReadingProgressRecord, "bookId" | "chapter">): string {
  return `${row.bookId}:${row.chapter}`;
}

export function planDaySyncKey(row: Pick<PlanDayRecord, "planId" | "day">): string {
  return `${row.planId}:${row.day}`;
}

export function mergeTombstones(left?: SyncTombstones, right?: SyncTombstones): SyncTombstones {
  const a = left ?? EMPTY_TOMBSTONES;
  const b = right ?? EMPTY_TOMBSTONES;
  return {
    notes: unique([...a.notes, ...b.notes]),
    bookmarks: unique([...a.bookmarks, ...b.bookmarks]),
    highlights: unique([...a.highlights, ...b.highlights]),
    sermons: unique([...a.sermons, ...b.sermons]),
  };
}

function laterIso(left?: string, right?: string): string {
  if (!left) return right ?? "";
  if (!right) return left;
  return left >= right ? left : right;
}

function pickNewer<T>(left: T, right: T, leftTime: string, rightTime: string): T {
  return rightTime > leftTime ? right : left;
}

function mergeByKey<T>(
  left: T[],
  right: T[],
  keyOf: (row: T) => string,
  timeOf: (row: T) => string,
): T[] {
  const map = new Map<string, T>();
  for (const row of left) map.set(keyOf(row), row);
  for (const row of right) {
    const key = keyOf(row);
    const existing = map.get(key);
    map.set(key, existing ? pickNewer(existing, row, timeOf(existing), timeOf(row)) : row);
  }
  return [...map.values()];
}

function sermonKey(row: SermonRecord): string {
  return sermonSyncKey(row);
}

export function sermonSyncKey(row: Pick<SermonRecord, "syncId" | "title" | "sundayDate" | "createdAt">): string {
  return row.syncId || `${row.title}:${row.sundayDate}:${row.createdAt}`;
}

function sermonTombstoneKeys(row: SermonRecord): string[] {
  return [sermonSyncKey(row), row.syncId, row.id != null ? `id:${row.id}` : ""].filter(Boolean) as string[];
}

export function mergeUserBackups(local: UserBackupV1, remote: UserBackupV1 | null): UserBackupV1 {
  if (!remote) {
    return { ...local, exportedAt: nowIso(), tombstones: mergeTombstones(local.tombstones) };
  }

  const tombstones = mergeTombstones(local.tombstones, remote.tombstones);
  const bookmarks = mergeByKey(
    local.bookmarks,
    remote.bookmarks,
    bookmarkSyncKey,
    (row) => row.updatedAt || row.createdAt,
  ).filter((row) => !tombstones.bookmarks.includes(bookmarkSyncKey(row)));

  const notes = mergeByKey(local.notes, remote.notes, noteSyncKey, (row) => row.updatedAt || row.createdAt).filter(
    (row) => !tombstones.notes.includes(noteSyncKey(row)) && !tombstones.notes.includes(row.verseId),
  );

  const highlights = mergeByKey(
    local.highlights,
    remote.highlights,
    (row) => row.verseId,
    (row) => row.createdAt,
  ).filter((row) => !tombstones.highlights.includes(row.verseId));

  const readingHistory = mergeByKey(
    local.readingHistory,
    remote.readingHistory,
    historySyncKey,
    (row) => row.openedAt,
  )
    .sort((left, right) => right.openedAt.localeCompare(left.openedAt))
    .slice(0, 40);

  const readingProgress = mergeByKey(
    local.readingProgress,
    remote.readingProgress,
    progressSyncKey,
    (row) => row.readAt,
  );

  const planDays = mergeByKey(local.planDays, remote.planDays, planDaySyncKey, (row) => row.completedAt ?? "").map(
    (row) => {
      const other =
        local.planDays.find((item) => planDaySyncKey(item) === planDaySyncKey(row)) ??
        remote.planDays.find((item) => planDaySyncKey(item) === planDaySyncKey(row));
      if (!other) return row;
      return {
        ...row,
        completed: row.completed || other.completed,
        completedAt: row.completed || other.completed ? laterIso(row.completedAt, other.completedAt) || undefined : undefined,
      };
    },
  );

  const localSermons = local.sermons ?? [];
  const remoteSermons = remote.sermons ?? [];
  const sermons = mergeByKey(localSermons, remoteSermons, sermonKey, (row) => row.updatedAt || row.createdAt).filter(
    (row) => !sermonTombstoneKeys(row).some((key) => tombstones.sermons.includes(key)),
  );
  const keptSermonKeys = new Set(sermons.map(sermonKey));
  const sermonPassages = [...(local.sermonPassages ?? []), ...(remote.sermonPassages ?? [])].filter((row) => {
    const key = row.sermonSyncId || String(row.sermonId);
    return keptSermonKeys.has(key) || sermons.some((sermon) => sermon.id === row.sermonId);
  });
  const uniquePassages = mergeByKey(
    sermonPassages,
    [],
    (row) => `${row.sermonSyncId || row.sermonId}:${row.verseId}:${row.verseStart}:${row.verseEnd}`,
    (row) => row.createdAt,
  );

  const readingPlans = mergeByKey(
    local.readingPlans ?? [],
    remote.readingPlans ?? [],
    (row: ReadingPlanRecord) => row.id,
    () => "",
  );

  const settings = (remote.exportedAt || "") > (local.exportedAt || "") ? remote.settings : local.settings;

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
    sermonPassages: uniquePassages,
    tombstones,
    settings,
  };
}

export function backupFingerprint(backup: UserBackupV1): string {
  const passages: SermonPassageRecord[] = backup.sermonPassages ?? [];
  return JSON.stringify({
    bookmarks: backup.bookmarks.length,
    highlights: backup.highlights.length,
    notes: backup.notes.length,
    history: backup.readingHistory.length,
    progress: backup.readingProgress.length,
    planDays: backup.planDays.filter((row) => row.completed).length,
    sermons: (backup.sermons ?? []).map((row) => `${sermonKey(row)}:${row.updatedAt}`).sort(),
    passages: passages.length,
    settings: backup.settings,
    tombstones: backup.tombstones,
  });
}

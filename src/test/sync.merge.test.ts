import { describe, expect, it } from "vitest";
import { mergeUserBackups } from "@/utils/mergeBackup";
import type { UserBackupV1 } from "@/types/userData";

function backup(partial: Partial<UserBackupV1>): UserBackupV1 {
  return {
    version: 1,
    app: "NJC Bible App",
    exportedAt: "2026-01-01T00:00:00.000Z",
    bookmarks: [],
    highlights: [],
    notes: [],
    readingHistory: [],
    readingProgress: [],
    planDays: [],
    sermons: [],
    sermonPassages: [],
    settings: { lastBookId: "john" },
    ...partial,
  };
}

describe("account sync merge", () => {
  it("keeps notes from both devices and prefers the newer text", () => {
    const local = backup({
      notes: [
        {
          translationId: "kjv",
          bookId: "john",
          chapter: 3,
          verseNumber: 16,
          verseId: "kjv:john:3:16",
          text: "old",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    const remote = backup({
      exportedAt: "2026-02-01T00:00:00.000Z",
      notes: [
        {
          translationId: "kjv",
          bookId: "john",
          chapter: 3,
          verseNumber: 16,
          verseId: "kjv:john:3:16",
          text: "new",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-02-01T00:00:00.000Z",
        },
        {
          translationId: "kjv",
          bookId: "psalms",
          chapter: 23,
          verseNumber: 1,
          verseId: "kjv:psalms:23:1",
          text: "tablet note",
          createdAt: "2026-02-01T00:00:00.000Z",
          updatedAt: "2026-02-01T00:00:00.000Z",
        },
      ],
    });
    const merged = mergeUserBackups(local, remote);
    expect(merged.notes).toHaveLength(2);
    expect(merged.notes.find((row) => row.verseId === "kjv:john:3:16")?.text).toBe("new");
  });

  it("honors deletes and unions completed plan days", () => {
    const local = backup({
      notes: [
        {
          translationId: "kjv",
          bookId: "john",
          chapter: 1,
          verseNumber: 1,
          verseId: "kjv:john:1:1",
          text: "keep",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      tombstones: { notes: ["kjv:john:3:16"], bookmarks: [], highlights: [], sermons: [] },
      planDays: [
        {
          planId: "njc-plan",
          day: 1,
          label: "Day 1",
          readings: [],
          completed: true,
          completedAt: "2026-01-02T00:00:00.000Z",
        },
      ],
    });
    const remote = backup({
      notes: [
        {
          translationId: "kjv",
          bookId: "john",
          chapter: 3,
          verseNumber: 16,
          verseId: "kjv:john:3:16",
          text: "deleted on phone",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      planDays: [
        {
          planId: "njc-plan",
          day: 2,
          label: "Day 2",
          readings: [],
          completed: true,
          completedAt: "2026-01-03T00:00:00.000Z",
        },
      ],
    });
    const merged = mergeUserBackups(local, remote);
    expect(merged.notes.map((row) => row.verseId)).toEqual(["kjv:john:1:1"]);
    expect(merged.planDays.filter((row) => row.completed).map((row) => row.day).sort()).toEqual([1, 2]);
  });
});

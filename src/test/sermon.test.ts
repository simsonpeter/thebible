import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db";
import { exportUserData, importUserData, resetUserData } from "@/services/backupService";
import {
  addSermonPassage,
  createSermon,
  formatSermonDocument,
  listSermonPassages,
  listSermons,
  sermonFilename,
  updateSermon,
} from "@/services/sermonService";
import { upcomingSundayKey } from "@/utils/misc";

async function resetDb() {
  await db.delete();
  await db.open();
}

beforeEach(async () => {
  await resetDb();
});

describe("sermon notebooks", () => {
  it("creates a Sunday sermon, stores verse snapshots, and formats Drive-ready text", async () => {
    const sunday = upcomingSundayKey(new Date("2026-09-19T12:00:00"));
    expect(sunday).toBe("2026-09-20");

    const id = await createSermon({ title: "God so loved", sundayDate: sunday });
    await updateSermon(id, { body: "Love is the theme." });
    await addSermonPassage(id, {
      id: "kjv:john:3:16",
      translationId: "kjv",
      bookId: "john",
      chapter: 3,
      number: 16,
      text: "For God so loved the world.",
    });
    await addSermonPassage(id, {
      id: "kjv:john:3:16",
      translationId: "kjv",
      bookId: "john",
      chapter: 3,
      number: 16,
      text: "duplicate should be ignored",
    });

    const sermons = await listSermons();
    const passages = await listSermonPassages(id);
    expect(sermons[0]?.title).toBe("God so loved");
    expect(passages).toHaveLength(1);

    const document = formatSermonDocument(sermons[0]!, passages);
    expect(document).toContain("God so loved");
    expect(document).toContain("2026-09-20");
    expect(document).toContain("Love is the theme.");
    expect(document).toContain("John 3:16 (KJV)");
    expect(document).toContain("For God so loved the world.");
    expect(sermonFilename(sermons[0]!)).toBe("2026-09-20-god-so-loved.txt");
  });

  it("backs up and restores sermons", async () => {
    const id = await createSermon({ title: "Restore me", sundayDate: "2026-09-27" });
    await addSermonPassage(id, {
      id: "kjv:psalms:23:1",
      translationId: "kjv",
      bookId: "psalms",
      chapter: 23,
      number: 1,
      text: "The Lord is my shepherd.",
    });
    const backup = await exportUserData();
    expect(backup.sermons).toHaveLength(1);
    await resetUserData();
    expect(await listSermons()).toHaveLength(0);
    await importUserData(backup);
    const restored = await listSermons();
    expect(restored[0]?.title).toBe("Restore me");
    expect(await listSermonPassages(restored[0]!.id!)).toHaveLength(1);
  });
});

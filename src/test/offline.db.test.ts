import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db";
import { addBookmark, deleteBookmark, listBookmarks } from "@/services/bookmarkService";
import { setHighlight, listHighlights, removeHighlight } from "@/services/highlightService";
import { addNote, listNotes, searchNotes, deleteNote } from "@/services/noteService";
import { recordChapterOpen, listRecentHistory, clearHistory } from "@/services/historyService";
import { markChapterRead, getProgressSummary } from "@/services/progressService";
import { seedReadingPlans, listPlans, togglePlanDay, planProgress } from "@/services/planService";
import { exportUserData, importUserData, resetUserData } from "@/services/backupService";
import { importBiblePayload } from "@/services/bibleImport";
import { getChapterVerses, getParallelVerses } from "@/services/bibleService";
import { searchBible } from "@/services/searchService";
import { saveSettings, loadSettings } from "@/services/settingsService";

async function resetDb() {
  await db.delete();
  await db.open();
}

beforeEach(async () => {
  await resetDb();
});

describe("user data stores", () => {
  it("supports bookmarks, highlights, and notes", async () => {
    const bookmarkId = await addBookmark({
      translationId: "kjv",
      bookId: "john",
      chapter: 3,
      verseStart: 16,
      verseEnd: 16,
      title: "Favorites",
      category: "Favorites",
    });
    expect((await listBookmarks())[0]?.title).toBe("Favorites");
    await deleteBookmark(bookmarkId);

    await setHighlight({
      verseId: "kjv:john:3:16",
      translationId: "kjv",
      bookId: "john",
      chapter: 3,
      verseNumber: 16,
      color: "yellow",
    });
    expect((await listHighlights())[0]?.color).toBe("yellow");
    await removeHighlight("kjv:john:3:16");

    const noteId = await addNote({
      translationId: "kjv",
      bookId: "john",
      chapter: 3,
      verseNumber: 16,
      verseId: "kjv:john:3:16",
      text: "My favorite promise.",
    });
    expect((await searchNotes("favorite"))[0]?.text).toContain("favorite");
    await deleteNote(noteId);
    expect(await listNotes()).toHaveLength(0);
  });

  it("records history and progress", async () => {
    await recordChapterOpen("kjv", "john", 3);
    await recordChapterOpen("kjv", "psalms", 23);
    expect(await listRecentHistory(5)).toHaveLength(2);
    await markChapterRead("john", 3);
    const summary = await getProgressSummary();
    expect(summary.chaptersRead).toBe(1);
    await clearHistory();
    expect(await listRecentHistory()).toHaveLength(0);
  });

  it("seeds and updates reading plans", async () => {
    await seedReadingPlans();
    const plans = await listPlans();
    expect(plans.map((plan) => plan.id).sort()).toEqual(
      ["bible-1-year", "gospels-30", "njc-plan", "nt-90", "proverbs-31", "psalms-30"],
    );
    await togglePlanDay("proverbs-31", 1, true);
    const progress = await planProgress("proverbs-31");
    expect(progress.completed).toBe(1);
    expect(progress.total).toBe(31);
  });

  it("exports and restores user data", async () => {
    await addBookmark({
      translationId: "kjv",
      bookId: "romans",
      chapter: 8,
      verseStart: 28,
      verseEnd: 28,
      title: "Study",
      category: "Study",
    });
    await saveSettings({ defaultTranslation: "kjv" });
    const backup = await exportUserData();
    await resetUserData();
    expect(await listBookmarks()).toHaveLength(0);
    await importUserData(backup);
    expect((await listBookmarks())[0]?.bookId).toBe("romans");
    expect((await loadSettings()).defaultTranslation).toBe("kjv");
  });
});

describe("bible import, search, and parallel sync", () => {
  it("imports sample data and searches offline", async () => {
    await importBiblePayload(
      {
        translation: { id: "kjv", name: "King James Version", language: "en", isDemo: false },
        books: [
          {
            id: "john",
            name: "John",
            chapters: [
              {
                number: 3,
                verses: [
                  { number: 16, text: "For God so loved the world, that he gave his only begotten Son." },
                  { number: 17, text: "For God sent not his Son into the world to condemn the world." },
                ],
              },
            ],
          },
        ],
      },
      { allowPartial: true },
    );
    await importBiblePayload(
      {
        translation: { id: "bsi-ov", name: "BSI OV", language: "ta", isDemo: true },
        books: [
          {
            id: "john",
            name: "யோவான்",
            chapters: [
              {
                number: 3,
                verses: [
                  { number: 16, text: "[Licensed Bible text required]" },
                  { number: 17, text: "[Licensed Bible text required]" },
                ],
              },
            ],
          },
        ],
      },
      { allowPartial: true, allowPlaceholders: true },
    );

    const kjv = await getChapterVerses("kjv", "john", 3);
    expect(kjv[0]?.text).toContain("For God so loved the world");
    const pairs = await getParallelVerses("john", 3);
    expect(pairs[0]?.byId.kjv?.number).toBe(pairs[0]?.byId["bsi-ov"]?.number);
    const hits = await searchBible({ text: "loved", translationId: "kjv", scope: "current" });
    expect(hits[0]?.verse.number).toBe(16);
    const tamilHits = await searchBible({ text: "Licensed", translationId: "bsi-ov", scope: "current" });
    expect(tamilHits).toHaveLength(0);
  });
});

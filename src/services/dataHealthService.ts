import { db } from "@/db";

export interface DataHealthReport {
  translations: Array<{ id: string; name: string; verses: number; ready: boolean }>;
  strongsReady: boolean;
  commentaryBrief: boolean;
  commentaryFull: boolean;
  bookmarks: number;
  notes: number;
  sermons: number;
}

export async function getDataHealth(): Promise<DataHealthReport> {
  const translations = await db.translations.toArray();
  const known = [
    { id: "bsi-ov", name: "Tamil O.V." },
    { id: "thngv", name: "THNGV" },
    { id: "tanglish", name: "Tanglish" },
    { id: "kjv", name: "KJV" },
    { id: "sv", name: "SV" },
  ];
  const reportTranslations = known.map((item) => {
    const row = translations.find((entry) => entry.id === item.id);
    const verses = row?.verseCount ?? 0;
    return {
      id: item.id,
      name: item.name,
      verses,
      ready: Boolean(row && !row.isDemo && verses > 0),
    };
  });

  let strongsReady = false;
  try {
    const response = await fetch(new URL("bible-data/strongs/strongs.json", document.baseURI));
    strongsReady = response.ok;
  } catch {
    strongsReady = false;
  }

  let commentaryBrief = false;
  let commentaryFull = false;
  try {
    const brief = await fetch(new URL("bible-data/commentary/commentary.json", document.baseURI));
    commentaryBrief = brief.ok;
  } catch {
    commentaryBrief = false;
  }
  try {
    const full = await fetch(new URL("bible-data/commentary/full-commentary.json", document.baseURI));
    commentaryFull = full.ok;
  } catch {
    commentaryFull = false;
  }

  return {
    translations: reportTranslations,
    strongsReady,
    commentaryBrief,
    commentaryFull,
    bookmarks: await db.bookmarks.count(),
    notes: await db.notes.count(),
    sermons: await db.sermons.count(),
  };
}

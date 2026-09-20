import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "bible-data", "tanglish");
const OUT_FILE = path.join(OUT_DIR, "tanglish.json");
const SOURCE_ZIP =
  "https://github.com/yesudas/all-bible-databases/raw/main/Bibles/Tamil-Bible-Database-and-Software-Modules/Tanglish/TAMRB-SimpleJSON.zip";
const LOCAL_SOURCE = path.join(ROOT, "tmp-tanglish", "out", "TAMRB-SimpleJSON");

const OSIS_TO_ID = {
  Gen: "genesis",
  Exod: "exodus",
  Lev: "leviticus",
  Num: "numbers",
  Deut: "deuteronomy",
  Josh: "joshua",
  Judg: "judges",
  Ruth: "ruth",
  "1Sam": "1-samuel",
  "2Sam": "2-samuel",
  "1Kgs": "1-kings",
  "2Kgs": "2-kings",
  "1Chr": "1-chronicles",
  "2Chr": "2-chronicles",
  Ezra: "ezra",
  Neh: "nehemiah",
  Esth: "esther",
  Job: "job",
  Ps: "psalms",
  Prov: "proverbs",
  Eccl: "ecclesiastes",
  Song: "song-of-solomon",
  Isa: "isaiah",
  Jer: "jeremiah",
  Lam: "lamentations",
  Ezek: "ezekiel",
  Dan: "daniel",
  Hos: "hosea",
  Joel: "joel",
  Amos: "amos",
  Obad: "obadiah",
  Jonah: "jonah",
  Mic: "micah",
  Nah: "nahum",
  Hab: "habakkuk",
  Zeph: "zephaniah",
  Hag: "haggai",
  Zech: "zechariah",
  Mal: "malachi",
  Matt: "matthew",
  Mark: "mark",
  Luke: "luke",
  John: "john",
  Acts: "acts",
  Rom: "romans",
  "1Cor": "1-corinthians",
  "2Cor": "2-corinthians",
  Gal: "galatians",
  Eph: "ephesians",
  Phil: "philippians",
  Col: "colossians",
  "1Thess": "1-thessalonians",
  "2Thess": "2-thessalonians",
  "1Tim": "1-timothy",
  "2Tim": "2-timothy",
  Titus: "titus",
  Phlm: "philemon",
  Heb: "hebrews",
  Jas: "james",
  "1Pet": "1-peter",
  "2Pet": "2-peter",
  "1John": "1-john",
  "2John": "2-john",
  "3John": "3-john",
  Jude: "jude",
  Rev: "revelation",
};

function cleanVerse(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function readSourceText() {
  if (fs.existsSync(LOCAL_SOURCE)) {
    return fs.readFileSync(LOCAL_SOURCE, "utf8");
  }
  const zipPath = path.join(ROOT, "tmp-tanglish", "TAMRB-SimpleJSON.zip");
  const outDir = path.join(ROOT, "tmp-tanglish", "out");
  fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(zipPath)) {
    execFileSync("curl", ["-L", "-o", zipPath, SOURCE_ZIP], { stdio: "inherit" });
  }
  execFileSync("tar", ["-xf", zipPath, "-C", outDir], { stdio: "inherit" });
  if (!fs.existsSync(LOCAL_SOURCE)) {
    throw new Error("Could not extract TAMRB-SimpleJSON.");
  }
  return fs.readFileSync(LOCAL_SOURCE, "utf8");
}

const raw = JSON.parse(readSourceText().replace(/^\uFEFF/, "").trim());
const booksRaw = raw?.osis?.[0]?.osisText?.[0]?.div;
if (!Array.isArray(booksRaw)) {
  throw new Error("Tanglish SimpleJSON did not contain OSIS book divisions.");
}

const books = [];
for (const book of booksRaw) {
  const osisId = String(book?.osisID?._value ?? "").trim();
  const id = OSIS_TO_ID[osisId];
  if (!id) {
    throw new Error(`Unknown OSIS book id: ${osisId || "(empty)"}`);
  }
  const englishName = String(book?.name?._value ?? id).trim();
  const chapters = (book.chapter ?? []).map((chapter) => ({
    number: Number(chapter.cnumber),
    verses: (chapter.verse ?? []).map((verse) => ({
      number: Number(verse.vnumber),
      text: cleanVerse(verse._text),
    })),
  }));
  if (chapters.some((chapter) => chapter.verses.some((verse) => !verse.text))) {
    throw new Error(`${englishName} contains an empty verse.`);
  }
  books.push({
    id,
    name: englishName,
    nameEnglish: englishName,
    chapters,
  });
}

if (books.length !== 66) {
  throw new Error(`Expected 66 books, received ${books.length}.`);
}

const payload = {
  translation: {
    id: "tanglish",
    name: "Tanglish Bible",
    abbreviation: "Tanglish",
    language: "en",
    license: "Tamil Romanised Bible (TAMRB). Packaged from a public Bible-module collection.",
    licenseDetails:
      "Romanized Tamil (Tanglish) wording from TAMRB / Tamil Romanised Bible 2019 modules in https://github.com/yesudas/all-bible-databases (Tanglish folder). That repository describes the databases as publicly available and free to reuse in apps. This is a Latin-script rendering of classic Tamil Bible wording, not authorized BSI Tamil O.V. New Ortho.",
    source:
      "https://github.com/yesudas/all-bible-databases/tree/main/Bibles/Tamil-Bible-Database-and-Software-Modules/Tanglish",
    year: 2019,
    isDemo: false,
  },
  books,
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(payload));
console.log(`Wrote ${OUT_FILE} (${fs.statSync(OUT_FILE).size} bytes, ${books.length} books)`);

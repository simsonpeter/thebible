import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "public", "data", "kjv-source.json");
const OUT_DIR = path.join(ROOT, "bible-data", "kjv");
const OUT_FILE = path.join(OUT_DIR, "kjv.json");

const BOOKS = [
  "genesis", "exodus", "leviticus", "numbers", "deuteronomy", "joshua", "judges", "ruth",
  "1-samuel", "2-samuel", "1-kings", "2-kings", "1-chronicles", "2-chronicles", "ezra", "nehemiah",
  "esther", "job", "psalms", "proverbs", "ecclesiastes", "song-of-solomon", "isaiah", "jeremiah",
  "lamentations", "ezekiel", "daniel", "hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum",
  "habakkuk", "zephaniah", "haggai", "zechariah", "malachi", "matthew", "mark", "luke", "john", "acts",
  "romans", "1-corinthians", "2-corinthians", "galatians", "ephesians", "philippians", "colossians",
  "1-thessalonians", "2-thessalonians", "1-timothy", "2-timothy", "titus", "philemon", "hebrews",
  "james", "1-peter", "2-peter", "1-john", "2-john", "3-john", "jude", "revelation",
];

const NAMES = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum",
  "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
];

function stripBom(raw) {
  if (raw[0] === 0xff && raw[1] === 0xfe) return raw.subarray(2).toString("utf16le");
  if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) return raw.subarray(3).toString("utf8");
  return raw.toString("utf8").replace(/^\uFEFF/, "");
}

function cleanKjv(text) {
  return text.replace(/[{}]/g, "").replace(/¶/g, "").replace(/\s+/g, " ").trim();
}

const raw = fs.readFileSync(SOURCE);
const source = JSON.parse(stripBom(raw));
if (!Array.isArray(source) || source.length !== 66) {
  throw new Error("KJV source must contain 66 books.");
}

const payload = {
  translation: {
    id: "kjv",
    name: "King James Version",
    abbreviation: "KJV",
    language: "en",
    license: "Public Domain",
    year: 1769,
    isDemo: false,
    source: "Public-domain KJV (1769) packaged locally for NJC Bible App.",
  },
  books: source.map((book, index) => ({
    id: BOOKS[index],
    name: NAMES[index],
    nameEnglish: NAMES[index],
    chapters: book.chapters.map((verses, chapterIndex) => ({
      number: chapterIndex + 1,
      verses: verses.map((text, verseIndex) => ({
        number: verseIndex + 1,
        text: cleanKjv(text),
      })),
    })),
  })),
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(payload));
console.log(`Wrote ${OUT_FILE} (${fs.statSync(OUT_FILE).size} bytes)`);

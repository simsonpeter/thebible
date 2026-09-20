import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "bible-data", "sv");
const OUT_FILE = path.join(OUT_DIR, "sv.json");
const SOURCE =
  "https://raw.githubusercontent.com/seven1m/open-bibles/master/dut-statenvertaling.zefania.xml";
const LOCAL_SOURCE = path.join(ROOT, "tmp-sv", "dut-statenvertaling.zefania.xml");

const BOOK_IDS = [
  "genesis",
  "exodus",
  "leviticus",
  "numbers",
  "deuteronomy",
  "joshua",
  "judges",
  "ruth",
  "1-samuel",
  "2-samuel",
  "1-kings",
  "2-kings",
  "1-chronicles",
  "2-chronicles",
  "ezra",
  "nehemiah",
  "esther",
  "job",
  "psalms",
  "proverbs",
  "ecclesiastes",
  "song-of-solomon",
  "isaiah",
  "jeremiah",
  "lamentations",
  "ezekiel",
  "daniel",
  "hosea",
  "joel",
  "amos",
  "obadiah",
  "jonah",
  "micah",
  "nahum",
  "habakkuk",
  "zephaniah",
  "haggai",
  "zechariah",
  "malachi",
  "matthew",
  "mark",
  "luke",
  "john",
  "acts",
  "romans",
  "1-corinthians",
  "2-corinthians",
  "galatians",
  "ephesians",
  "philippians",
  "colossians",
  "1-thessalonians",
  "2-thessalonians",
  "1-timothy",
  "2-timothy",
  "titus",
  "philemon",
  "hebrews",
  "james",
  "1-peter",
  "2-peter",
  "1-john",
  "2-john",
  "3-john",
  "jude",
  "revelation",
];

function decodeXml(text) {
  return String(text ?? "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function readSource() {
  if (fs.existsSync(LOCAL_SOURCE)) {
    return fs.readFileSync(LOCAL_SOURCE, "utf8");
  }
  fs.mkdirSync(path.dirname(LOCAL_SOURCE), { recursive: true });
  execFileSync("curl", ["-L", "-o", LOCAL_SOURCE, SOURCE], { stdio: "inherit" });
  return fs.readFileSync(LOCAL_SOURCE, "utf8");
}

function convert(xml) {
  const bookBlocks = [...xml.matchAll(/<BIBLEBOOK\b([^>]*)>([\s\S]*?)<\/BIBLEBOOK>/g)];
  if (bookBlocks.length !== 66) {
    throw new Error(`Expected 66 books, found ${bookBlocks.length}`);
  }

  const books = bookBlocks.map((match, index) => {
    const attrs = match[1];
    const body = match[2];
    const number = Number(/bnumber="(\d+)"/.exec(attrs)?.[1] ?? 0);
    if (number !== index + 1) {
      throw new Error(`Unexpected book order at ${index + 1}: bnumber=${number}`);
    }
    const name = /bname="([^"]+)"/.exec(attrs)?.[1] ?? BOOK_IDS[index];
    const chapters = [...body.matchAll(/<CHAPTER\b([^>]*)>([\s\S]*?)<\/CHAPTER>/g)].map((chapterMatch) => {
      const chapterNumber = Number(/cnumber="(\d+)"/.exec(chapterMatch[1])?.[1] ?? 0);
      const verses = [...chapterMatch[2].matchAll(/<VERS\b([^>]*)>([\s\S]*?)<\/VERS>/g)].map((verseMatch) => ({
        number: Number(/vnumber="(\d+)"/.exec(verseMatch[1])?.[1] ?? 0),
        text: decodeXml(verseMatch[2]),
      }));
      return { number: chapterNumber, verses };
    });
    return {
      id: BOOK_IDS[index],
      name,
      nameEnglish: BOOK_IDS[index]
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      testament: index < 39 ? "OT" : "NT",
      chapters,
    };
  });

  return {
    translation: {
      id: "sv",
      name: "Statenvertaling (1637)",
      abbreviation: "SV",
      language: "nl",
      license: "Public Domain. Not Herziene Statenvertaling (HSV).",
      licenseDetails:
        "Classic Dutch Statenvertaling (1637) from https://github.com/seven1m/open-bibles (dut-statenvertaling.zefania.xml). Public domain. This is not the copyrighted Herziene Statenvertaling (HSV).",
      source: "https://github.com/seven1m/open-bibles",
      year: 1637,
      isDemo: false,
    },
    books,
  };
}

const payload = convert(readSource());
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(payload));
const verses = payload.books.reduce(
  (sum, book) => sum + book.chapters.reduce((inner, chapter) => inner + chapter.verses.length, 0),
  0,
);
console.log(`Wrote ${OUT_FILE} (${payload.books.length} books, ${verses} verses)`);

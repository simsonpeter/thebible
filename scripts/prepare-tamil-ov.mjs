import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "bible-data", "bsi-ov");
const OUT_FILE = path.join(OUT_DIR, "bsi-ov.json");
const SOURCE = "https://raw.githubusercontent.com/aruljohn/Bible-tamil/main";

const BOOKS = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Songs",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
];

const IDS = [
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

function cleanVerse(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchJson(fileName) {
  const url = `${SOURCE}/${encodeURIComponent(fileName)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${fileName}: HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchBook(englishName) {
  const fileName = `${englishName}.json`;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await fetchJson(fileName);
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  throw new Error(`Failed to download ${fileName}`);
}

const books = [];
const BATCH = 8;
for (let start = 0; start < BOOKS.length; start += BATCH) {
  const slice = BOOKS.slice(start, start + BATCH);
  process.stdout.write(`Fetching ${slice[0]}.json–${slice[slice.length - 1]}.json (${start + 1}-${start + slice.length}/${BOOKS.length})\n`);
  const rawBooks = await Promise.all(slice.map((englishName) => fetchBook(englishName)));
  rawBooks.forEach((raw, offset) => {
    const index = start + offset;
    const englishName = BOOKS[index];
    const tamilName = String(raw.book?.tamil ?? "").trim();
    const chapters = (raw.chapters ?? []).map((chapter) => ({
      number: Number(chapter.chapter),
      verses: (chapter.verses ?? []).map((verse) => ({
        number: Number(verse.verse),
        text: cleanVerse(verse.text),
      })),
    }));
    const empty = chapters.some((chapter) => chapter.verses.some((verse) => !verse.text));
    if (empty) {
      throw new Error(`${englishName} contains an empty verse.`);
    }
    books.push({
      id: IDS[index],
      name: tamilName || englishName,
      nameTamil: tamilName || undefined,
      nameEnglish: englishName,
      chapters,
    });
  });
}

if (books.length !== 66) {
  throw new Error(`Expected 66 books, received ${books.length}.`);
}

const payload = {
  translation: {
    id: "bsi-ov",
    name: "Tamil Bible (Old Version)",
    abbreviation: "தமிழ் O.V.",
    language: "ta",
    license: "Classic Tamil Old Version. Not BSI Tamil O.V. New Ortho.",
    licenseDetails:
      "Packaged from the per-book JSON files in https://github.com/aruljohn/Bible-tamil. That repository's MIT license covers the packaging, not a named publisher grant for BSI New Ortho. The wording is classic Tamil Old Version (pre-New Ortho). The 1957 Bible Society of India and Ceylon Tamil Old Version is documented as public domain in India. NJC Bible App does not present this text as authorized BSI New Ortho.",
    source: "https://github.com/aruljohn/Bible-tamil",
    year: 1957,
    isDemo: false,
  },
  books,
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(payload));
console.log(`Wrote ${OUT_FILE} (${fs.statSync(OUT_FILE).size} bytes, ${books.length} books)`);

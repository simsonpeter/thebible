import type { BookDefinition } from "@/types/bible";

export const BOOK_CATALOG: BookDefinition[] = [
  { id: "genesis", order: 1, testament: "OT", nameEnglish: "Genesis", nameTamil: "ஆதியாகமம்", chapterCount: 50, aliases: ["genesis", "gen", "gn", "ge", "ஆதியாகமம்", "ஆதி", "ஆதியாக"] },
  { id: "exodus", order: 2, testament: "OT", nameEnglish: "Exodus", nameTamil: "யாத்திராகமம்", chapterCount: 40, aliases: ["exodus", "exo", "ex", "யாத்திராகமம்", "யாத்திரா", "யாத்"] },
  { id: "leviticus", order: 3, testament: "OT", nameEnglish: "Leviticus", nameTamil: "லேவியராகமம்", chapterCount: 27, aliases: ["leviticus", "lev", "lv", "லேவியராகமம்", "லேவியர்", "லேவி"] },
  { id: "numbers", order: 4, testament: "OT", nameEnglish: "Numbers", nameTamil: "எண்ணாகமம்", chapterCount: 36, aliases: ["numbers", "num", "nm", "nu", "எண்ணாகமம்", "எண்"] },
  { id: "deuteronomy", order: 5, testament: "OT", nameEnglish: "Deuteronomy", nameTamil: "உபாகமம்", chapterCount: 34, aliases: ["deuteronomy", "deut", "dt", "de", "உபாகமம்", "உபா"] },
  { id: "joshua", order: 6, testament: "OT", nameEnglish: "Joshua", nameTamil: "யோசுவா", chapterCount: 24, aliases: ["joshua", "josh", "jos", "js", "யோசுவா"] },
  { id: "judges", order: 7, testament: "OT", nameEnglish: "Judges", nameTamil: "நியாயாதிபதிகள்", chapterCount: 21, aliases: ["judges", "judg", "jdg", "jg", "நியாயாதிபதிகள்", "நியாயாதிபதி"] },
  { id: "ruth", order: 8, testament: "OT", nameEnglish: "Ruth", nameTamil: "ரூத்", chapterCount: 4, aliases: ["ruth", "ru", "ரூத்"] },
  { id: "1-samuel", order: 9, testament: "OT", nameEnglish: "1 Samuel", nameTamil: "1 சாமுவேல்", chapterCount: 31, aliases: ["1 samuel", "1samuel", "1 sam", "1sam", "1sa", "i samuel", "1 சாமுவேல்", "சாமுவேல் 1"] },
  { id: "2-samuel", order: 10, testament: "OT", nameEnglish: "2 Samuel", nameTamil: "2 சாமுவேல்", chapterCount: 24, aliases: ["2 samuel", "2samuel", "2 sam", "2sam", "2sa", "ii samuel", "2 சாமுவேல்", "சாமுவேல் 2"] },
  { id: "1-kings", order: 11, testament: "OT", nameEnglish: "1 Kings", nameTamil: "1 இராஜாக்கள்", chapterCount: 22, aliases: ["1 kings", "1kings", "1 kgs", "1kgs", "1ki", "i kings", "1 இராஜாக்கள்"] },
  { id: "2-kings", order: 12, testament: "OT", nameEnglish: "2 Kings", nameTamil: "2 இராஜாக்கள்", chapterCount: 25, aliases: ["2 kings", "2kings", "2 kgs", "2kgs", "2ki", "ii kings", "2 இராஜாக்கள்"] },
  { id: "1-chronicles", order: 13, testament: "OT", nameEnglish: "1 Chronicles", nameTamil: "1 நாளாகமம்", chapterCount: 29, aliases: ["1 chronicles", "1chronicles", "1 chr", "1chr", "1ch", "i chronicles", "1 நாளாகமம்"] },
  { id: "2-chronicles", order: 14, testament: "OT", nameEnglish: "2 Chronicles", nameTamil: "2 நாளாகமம்", chapterCount: 36, aliases: ["2 chronicles", "2chronicles", "2 chr", "2chr", "2ch", "ii chronicles", "2 நாளாகமம்"] },
  { id: "ezra", order: 15, testament: "OT", nameEnglish: "Ezra", nameTamil: "எஸ்றா", chapterCount: 10, aliases: ["ezra", "ezr", "எஸ்றா"] },
  { id: "nehemiah", order: 16, testament: "OT", nameEnglish: "Nehemiah", nameTamil: "நெகேமியா", chapterCount: 13, aliases: ["nehemiah", "neh", "ne", "நெகேமியா"] },
  { id: "esther", order: 17, testament: "OT", nameEnglish: "Esther", nameTamil: "எஸ்தர்", chapterCount: 10, aliases: ["esther", "est", "et", "எஸ்தர்"] },
  { id: "job", order: 18, testament: "OT", nameEnglish: "Job", nameTamil: "யோபு", chapterCount: 42, aliases: ["job", "jb", "யோபு"] },
  { id: "psalms", order: 19, testament: "OT", nameEnglish: "Psalms", nameTamil: "சங்கீதம்", chapterCount: 150, aliases: ["psalms", "psalm", "ps", "psa", "pss", "சங்கீதம்", "சங்கீதங்கள்", "சங்"] },
  { id: "proverbs", order: 20, testament: "OT", nameEnglish: "Proverbs", nameTamil: "நீதிமொழிகள்", chapterCount: 31, aliases: ["proverbs", "prov", "pro", "pr", "நீதிமொழிகள்", "நீதிமொழி"] },
  { id: "ecclesiastes", order: 21, testament: "OT", nameEnglish: "Ecclesiastes", nameTamil: "பிரசங்கி", chapterCount: 12, aliases: ["ecclesiastes", "eccl", "ecc", "ec", "qoheleth", "பிரசங்கி"] },
  { id: "song-of-solomon", order: 22, testament: "OT", nameEnglish: "Song of Solomon", nameTamil: "உன்னதப்பாட்டு", chapterCount: 8, aliases: ["song of solomon", "song of songs", "song", "sos", "so", "canticle", "canticles", "உன்னதப்பாட்டு"] },
  { id: "isaiah", order: 23, testament: "OT", nameEnglish: "Isaiah", nameTamil: "ஏசாயா", chapterCount: 66, aliases: ["isaiah", "isa", "is", "ஏசாயா"] },
  { id: "jeremiah", order: 24, testament: "OT", nameEnglish: "Jeremiah", nameTamil: "எரேமியா", chapterCount: 52, aliases: ["jeremiah", "jer", "jr", "எரேமியா"] },
  { id: "lamentations", order: 25, testament: "OT", nameEnglish: "Lamentations", nameTamil: "புலம்பல்", chapterCount: 5, aliases: ["lamentations", "lam", "la", "புலம்பல்"] },
  { id: "ezekiel", order: 26, testament: "OT", nameEnglish: "Ezekiel", nameTamil: "எசேக்கியேல்", chapterCount: 48, aliases: ["ezekiel", "ezek", "eze", "ezk", "எசேக்கியேல்"] },
  { id: "daniel", order: 27, testament: "OT", nameEnglish: "Daniel", nameTamil: "தானியேல்", chapterCount: 12, aliases: ["daniel", "dan", "da", "தானியேல்"] },
  { id: "hosea", order: 28, testament: "OT", nameEnglish: "Hosea", nameTamil: "ஓசியா", chapterCount: 14, aliases: ["hosea", "hos", "ho", "ஓசியா"] },
  { id: "joel", order: 29, testament: "OT", nameEnglish: "Joel", nameTamil: "யோவேல்", chapterCount: 3, aliases: ["joel", "jl", "யோவேல்"] },
  { id: "amos", order: 30, testament: "OT", nameEnglish: "Amos", nameTamil: "ஆமோஸ்", chapterCount: 9, aliases: ["amos", "am", "ஆமோஸ்"] },
  { id: "obadiah", order: 31, testament: "OT", nameEnglish: "Obadiah", nameTamil: "ஒபதியா", chapterCount: 1, aliases: ["obadiah", "obad", "ob", "ஒபதியா"] },
  { id: "jonah", order: 32, testament: "OT", nameEnglish: "Jonah", nameTamil: "யோனா", chapterCount: 4, aliases: ["jonah", "jnh", "jon", "யோனா"] },
  { id: "micah", order: 33, testament: "OT", nameEnglish: "Micah", nameTamil: "மீகா", chapterCount: 7, aliases: ["micah", "mic", "mca", "மீகா"] },
  { id: "nahum", order: 34, testament: "OT", nameEnglish: "Nahum", nameTamil: "நாகூம்", chapterCount: 3, aliases: ["nahum", "nah", "na", "நாகூம்"] },
  { id: "habakkuk", order: 35, testament: "OT", nameEnglish: "Habakkuk", nameTamil: "ஆபகூக்", chapterCount: 3, aliases: ["habakkuk", "hab", "hk", "ஆபகூக்"] },
  { id: "zephaniah", order: 36, testament: "OT", nameEnglish: "Zephaniah", nameTamil: "செப்பனியா", chapterCount: 3, aliases: ["zephaniah", "zeph", "zep", "zp", "செப்பனியா"] },
  { id: "haggai", order: 37, testament: "OT", nameEnglish: "Haggai", nameTamil: "ஆகாய்", chapterCount: 2, aliases: ["haggai", "hag", "hg", "ஆகாய்"] },
  { id: "zechariah", order: 38, testament: "OT", nameEnglish: "Zechariah", nameTamil: "சகரியா", chapterCount: 14, aliases: ["zechariah", "zech", "zec", "zc", "சகரியா"] },
  { id: "malachi", order: 39, testament: "OT", nameEnglish: "Malachi", nameTamil: "மல்கியா", chapterCount: 4, aliases: ["malachi", "mal", "ml", "மல்கியா"] },
  { id: "matthew", order: 40, testament: "NT", nameEnglish: "Matthew", nameTamil: "மத்தேயு", chapterCount: 28, aliases: ["matthew", "matt", "mt", "mat", "மத்தேயு"] },
  { id: "mark", order: 41, testament: "NT", nameEnglish: "Mark", nameTamil: "மாற்கு", chapterCount: 16, aliases: ["mark", "mk", "mr", "மாற்கு"] },
  { id: "luke", order: 42, testament: "NT", nameEnglish: "Luke", nameTamil: "லூக்கா", chapterCount: 24, aliases: ["luke", "lk", "lu", "லூக்கா", "லுூக்கா"] },
  { id: "john", order: 43, testament: "NT", nameEnglish: "John", nameTamil: "யோவான்", chapterCount: 21, aliases: ["john", "jhn", "jn", "joh", "யோவான்"] },
  { id: "acts", order: 44, testament: "NT", nameEnglish: "Acts", nameTamil: "அப்போஸ்தலர்", chapterCount: 28, aliases: ["acts", "act", "ac", "அப்போஸ்தலர்", "அப்போஸ்தலர் நடபடிகள்", "அப்போஸ்தலருடைய நடபடிகள்"] },
  { id: "romans", order: 45, testament: "NT", nameEnglish: "Romans", nameTamil: "ரோமர்", chapterCount: 16, aliases: ["romans", "rom", "ro", "ரோமர்"] },
  { id: "1-corinthians", order: 46, testament: "NT", nameEnglish: "1 Corinthians", nameTamil: "1 கொரிந்தியர்", chapterCount: 16, aliases: ["1 corinthians", "1corinthians", "1 cor", "1cor", "1co", "i corinthians", "1 கொரிந்தியர்"] },
  { id: "2-corinthians", order: 47, testament: "NT", nameEnglish: "2 Corinthians", nameTamil: "2 கொரிந்தியர்", chapterCount: 13, aliases: ["2 corinthians", "2corinthians", "2 cor", "2cor", "2co", "ii corinthians", "2 கொரிந்தியர்"] },
  { id: "galatians", order: 48, testament: "NT", nameEnglish: "Galatians", nameTamil: "கலாத்தியர்", chapterCount: 6, aliases: ["galatians", "gal", "ga", "கலாத்தியர்"] },
  { id: "ephesians", order: 49, testament: "NT", nameEnglish: "Ephesians", nameTamil: "எபேசியர்", chapterCount: 6, aliases: ["ephesians", "eph", "எபேசியர்"] },
  { id: "philippians", order: 50, testament: "NT", nameEnglish: "Philippians", nameTamil: "பிலிப்பியர்", chapterCount: 4, aliases: ["philippians", "phil", "php", "phpil", "பிலிப்பியர்"] },
  { id: "colossians", order: 51, testament: "NT", nameEnglish: "Colossians", nameTamil: "கொலோசெயர்", chapterCount: 4, aliases: ["colossians", "col", "கொலோசெயர்"] },
  { id: "1-thessalonians", order: 52, testament: "NT", nameEnglish: "1 Thessalonians", nameTamil: "1 தெசலோனிக்கேயர்", chapterCount: 5, aliases: ["1 thessalonians", "1thessalonians", "1 thess", "1th", "1thess", "i thessalonians", "1 தெசலோனிக்கேயர்"] },
  { id: "2-thessalonians", order: 53, testament: "NT", nameEnglish: "2 Thessalonians", nameTamil: "2 தெசலோனிக்கேயர்", chapterCount: 3, aliases: ["2 thessalonians", "2thessalonians", "2 thess", "2th", "2thess", "ii thessalonians", "2 தெசலோனிக்கேயர்"] },
  { id: "1-timothy", order: 54, testament: "NT", nameEnglish: "1 Timothy", nameTamil: "1 தீமோத்தேயு", chapterCount: 6, aliases: ["1 timothy", "1timothy", "1 tim", "1ti", "1tim", "i timothy", "1 தீமோத்தேயு"] },
  { id: "2-timothy", order: 55, testament: "NT", nameEnglish: "2 Timothy", nameTamil: "2 தீமோத்தேயு", chapterCount: 4, aliases: ["2 timothy", "2timothy", "2 tim", "2ti", "2tim", "ii timothy", "2 தீமோத்தேயு"] },
  { id: "titus", order: 56, testament: "NT", nameEnglish: "Titus", nameTamil: "தீத்து", chapterCount: 3, aliases: ["titus", "tit", "தீத்து"] },
  { id: "philemon", order: 57, testament: "NT", nameEnglish: "Philemon", nameTamil: "பிலேமோன்", chapterCount: 1, aliases: ["philemon", "phm", "phlm", "பிலேமோன்"] },
  { id: "hebrews", order: 58, testament: "NT", nameEnglish: "Hebrews", nameTamil: "எபிரெயர்", chapterCount: 13, aliases: ["hebrews", "heb", "எபிரெயர்"] },
  { id: "james", order: 59, testament: "NT", nameEnglish: "James", nameTamil: "யாக்கோபு", chapterCount: 5, aliases: ["james", "jas", "jam", "யாக்கோபு"] },
  { id: "1-peter", order: 60, testament: "NT", nameEnglish: "1 Peter", nameTamil: "1 பேதுரு", chapterCount: 5, aliases: ["1 peter", "1peter", "1 pet", "1pe", "1pet", "i peter", "1 பேதுரு"] },
  { id: "2-peter", order: 61, testament: "NT", nameEnglish: "2 Peter", nameTamil: "2 பேதுரு", chapterCount: 3, aliases: ["2 peter", "2peter", "2 pet", "2pe", "2pet", "ii peter", "2 பேதுரு"] },
  { id: "1-john", order: 62, testament: "NT", nameEnglish: "1 John", nameTamil: "1 யோவான்", chapterCount: 5, aliases: ["1 john", "1john", "1 jn", "1jn", "1jo", "i john", "1 யோவான்"] },
  { id: "2-john", order: 63, testament: "NT", nameEnglish: "2 John", nameTamil: "2 யோவான்", chapterCount: 1, aliases: ["2 john", "2john", "2 jn", "2jn", "2jo", "ii john", "2 யோவான்"] },
  { id: "3-john", order: 64, testament: "NT", nameEnglish: "3 John", nameTamil: "3 யோவான்", chapterCount: 1, aliases: ["3 john", "3john", "3 jn", "3jn", "3jo", "iii john", "3 யோவான்"] },
  { id: "jude", order: 65, testament: "NT", nameEnglish: "Jude", nameTamil: "யூதா", chapterCount: 1, aliases: ["jude", "jud", "யூதா"] },
  { id: "revelation", order: 66, testament: "NT", nameEnglish: "Revelation", nameTamil: "வெளிப்படுத்தின விசேஷம்", chapterCount: 22, aliases: ["revelation", "rev", "re", "apocalypse", "வெளிப்படுத்தின விசேஷம்", "வெளிப்படுத்தல்", "வெளி"] },
];

const aliasIndex = new Map<string, BookDefinition>();
for (const book of [...BOOK_CATALOG].sort((a, b) => b.nameEnglish.length - a.nameEnglish.length)) {
  aliasIndex.set(book.id, book);
  aliasIndex.set(normalizeAlias(book.nameEnglish), book);
  aliasIndex.set(normalizeAlias(book.nameTamil), book);
  for (const alias of book.aliases) {
    aliasIndex.set(normalizeAlias(alias), book);
  }
}

export function normalizeAlias(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[.]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getBookById(id: string): BookDefinition | undefined {
  return BOOK_CATALOG.find((book) => book.id === id);
}

export function getBookByAlias(input: string): BookDefinition | undefined {
  return aliasIndex.get(normalizeAlias(input));
}

export function otBooks(): BookDefinition[] {
  return BOOK_CATALOG.filter((book) => book.testament === "OT");
}

export function ntBooks(): BookDefinition[] {
  return BOOK_CATALOG.filter((book) => book.testament === "NT");
}

export function totalChapters(testament?: "OT" | "NT"): number {
  return BOOK_CATALOG.filter((book) => !testament || book.testament === testament).reduce(
    (sum, book) => sum + book.chapterCount,
    0,
  );
}

export const TOTAL_CHAPTERS = totalChapters();
export const OT_CHAPTERS = totalChapters("OT");
export const NT_CHAPTERS = totalChapters("NT");

/** Offline topic index → verse lists for study. */

export interface TopicVerse {
  bookId: string;
  chapter: number;
  verse: number;
}

export interface BibleTopic {
  id: string;
  title: string;
  titleTamil: string;
  /** Short English note shown on the topic page. */
  summary: string;
  /** Tamil summary. */
  summaryTamil: string;
  /** Extra English/Tamil words that match this topic in search. */
  keywords: string[];
  verses: TopicVerse[];
}

export const BIBLE_TOPICS: BibleTopic[] = [
  {
    id: "faith",
    title: "Faith",
    titleTamil: "விசுவாசம்",
    summary: "Trusting God when you cannot see the outcome.",
    summaryTamil: "காணாததை நம்பி தேவனை சார்ந்திருத்தல்.",
    keywords: ["believe", "trust", "faithful", "விசுவாசம்", "நம்பிக்கை"],
    verses: [
      { bookId: "hebrews", chapter: 11, verse: 1 },
      { bookId: "romans", chapter: 10, verse: 17 },
      { bookId: "mark", chapter: 11, verse: 22 },
      { bookId: "2-corinthians", chapter: 5, verse: 7 },
      { bookId: "james", chapter: 1, verse: 6 },
      { bookId: "ephesians", chapter: 2, verse: 8 },
    ],
  },
  {
    id: "prayer",
    title: "Prayer",
    titleTamil: "ஜெபம்",
    summary: "Talking with God — ask, thank, and listen.",
    summaryTamil: "தேவனிடம் பேசுதல் — கேளுங்கள், நன்றியுங்கள்.",
    keywords: ["pray", "petition", "intercession", "ஜெபம்", "வேண்டுதல்"],
    verses: [
      { bookId: "philippians", chapter: 4, verse: 6 },
      { bookId: "matthew", chapter: 6, verse: 9 },
      { bookId: "1-thessalonians", chapter: 5, verse: 17 },
      { bookId: "jeremiah", chapter: 33, verse: 3 },
      { bookId: "james", chapter: 5, verse: 16 },
      { bookId: "matthew", chapter: 7, verse: 7 },
    ],
  },
  {
    id: "fear",
    title: "Fear not",
    titleTamil: "பயப்படாதே",
    summary: "Courage and calm when anxiety rises.",
    summaryTamil: "பயம் வரும்போது தைரியமும் அமைதியும்.",
    keywords: ["fear", "afraid", "anxiety", "courage", "பயம்", "பயப்படாதே"],
    verses: [
      { bookId: "isaiah", chapter: 41, verse: 10 },
      { bookId: "joshua", chapter: 1, verse: 9 },
      { bookId: "2-timothy", chapter: 1, verse: 7 },
      { bookId: "psalms", chapter: 27, verse: 1 },
      { bookId: "john", chapter: 14, verse: 27 },
      { bookId: "psalms", chapter: 56, verse: 3 },
    ],
  },
  {
    id: "peace",
    title: "Peace",
    titleTamil: "சமாதானம்",
    summary: "God’s peace that steadies heart and mind.",
    summaryTamil: "இதயத்தையும் மனதையும் அமைதிப்படுத்தும் சமாதானம்.",
    keywords: ["peace", "rest", "calm", "சமாதானம்", "அமைதி"],
    verses: [
      { bookId: "john", chapter: 14, verse: 27 },
      { bookId: "philippians", chapter: 4, verse: 7 },
      { bookId: "isaiah", chapter: 26, verse: 3 },
      { bookId: "romans", chapter: 5, verse: 1 },
      { bookId: "colossians", chapter: 3, verse: 15 },
    ],
  },
  {
    id: "love",
    title: "Love",
    titleTamil: "அன்பு",
    summary: "God’s love for us, and love for one another.",
    summaryTamil: "தேவன் நம்மீது வைத்த அன்பும், ஒருவருக்கொருவர் அன்பும்.",
    keywords: ["love", "charity", "compassion", "அன்பு", "அன்புள்ள"],
    verses: [
      { bookId: "john", chapter: 3, verse: 16 },
      { bookId: "1-corinthians", chapter: 13, verse: 4 },
      { bookId: "1-john", chapter: 4, verse: 8 },
      { bookId: "romans", chapter: 5, verse: 8 },
      { bookId: "matthew", chapter: 22, verse: 37 },
      { bookId: "1-corinthians", chapter: 13, verse: 13 },
    ],
  },
  {
    id: "strength",
    title: "Strength",
    titleTamil: "பெலன்",
    summary: "Power from God when you feel weak.",
    summaryTamil: "பலவீனத்தில் தேவன் தரும் பெலன்.",
    keywords: ["strength", "strong", "power", "weak", "பெலன்", "பலம்"],
    verses: [
      { bookId: "philippians", chapter: 4, verse: 13 },
      { bookId: "isaiah", chapter: 40, verse: 31 },
      { bookId: "2-corinthians", chapter: 12, verse: 9 },
      { bookId: "ephesians", chapter: 6, verse: 10 },
      { bookId: "psalms", chapter: 46, verse: 1 },
    ],
  },
  {
    id: "hope",
    title: "Hope",
    titleTamil: "நம்பிக்கை",
    summary: "Living hope rooted in God’s promises.",
    summaryTamil: "தேவ வாக்குத்தத்தங்களில் வேரூன்றிய நம்பிக்கை.",
    keywords: ["hope", "future", "promise", "நம்பிக்கை", "எதிர்பார்ப்பு"],
    verses: [
      { bookId: "jeremiah", chapter: 29, verse: 11 },
      { bookId: "romans", chapter: 15, verse: 13 },
      { bookId: "romans", chapter: 8, verse: 28 },
      { bookId: "hebrews", chapter: 6, verse: 19 },
      { bookId: "psalms", chapter: 42, verse: 11 },
    ],
  },
  {
    id: "healing",
    title: "Healing",
    titleTamil: "குணமாக்குதல்",
    summary: "The Lord who heals body, mind, and soul.",
    summaryTamil: "உடல், மனம், ஆவி — குணமாக்கும் கர்த்தர்.",
    keywords: ["heal", "healing", "sick", "disease", "குணம்", "வியாதி"],
    verses: [
      { bookId: "james", chapter: 5, verse: 14 },
      { bookId: "psalms", chapter: 103, verse: 3 },
      { bookId: "isaiah", chapter: 53, verse: 5 },
      { bookId: "jeremiah", chapter: 17, verse: 14 },
      { bookId: "exodus", chapter: 15, verse: 26 },
      { bookId: "matthew", chapter: 9, verse: 35 },
    ],
  },
  {
    id: "wisdom",
    title: "Wisdom",
    titleTamil: "ஞானம்",
    summary: "Ask God for wisdom to walk wisely.",
    summaryTamil: "ஞானமாக நடக்க தேவனிடம் கேளுங்கள்.",
    keywords: ["wisdom", "wise", "understanding", "ஞானம்", "புரிதல்"],
    verses: [
      { bookId: "james", chapter: 1, verse: 5 },
      { bookId: "proverbs", chapter: 3, verse: 5 },
      { bookId: "proverbs", chapter: 9, verse: 10 },
      { bookId: "psalms", chapter: 111, verse: 10 },
      { bookId: "colossians", chapter: 3, verse: 16 },
    ],
  },
  {
    id: "salvation",
    title: "Salvation",
    titleTamil: "இரட்சிப்பு",
    summary: "Saved by grace through faith in Jesus.",
    summaryTamil: "இயேசுவில் விசுவாசத்தால் கிருபையால் இரட்சிப்பு.",
    keywords: ["save", "salvation", "gospel", "grace", "இரட்சிப்பு", "இரட்சகர்"],
    verses: [
      { bookId: "romans", chapter: 10, verse: 9 },
      { bookId: "ephesians", chapter: 2, verse: 8 },
      { bookId: "acts", chapter: 16, verse: 31 },
      { bookId: "john", chapter: 14, verse: 6 },
      { bookId: "romans", chapter: 6, verse: 23 },
      { bookId: "john", chapter: 3, verse: 16 },
    ],
  },
  {
    id: "forgiveness",
    title: "Forgiveness",
    titleTamil: "மன்னிப்பு",
    summary: "Receiving and giving forgiveness.",
    summaryTamil: "மன்னிப்பைப் பெறுதலும் கொடுத்தலும்.",
    keywords: ["forgive", "forgiveness", "mercy", "மன்னிப்பு", "இரக்கம்"],
    verses: [
      { bookId: "1-john", chapter: 1, verse: 9 },
      { bookId: "ephesians", chapter: 4, verse: 32 },
      { bookId: "matthew", chapter: 6, verse: 14 },
      { bookId: "psalms", chapter: 103, verse: 12 },
      { bookId: "colossians", chapter: 3, verse: 13 },
    ],
  },
  {
    id: "joy",
    title: "Joy",
    titleTamil: "சந்தோஷம்",
    summary: "Joy in the Lord that circumstances cannot steal.",
    summaryTamil: "சூழ்நிலை எடுத்துவிட முடியாத கர்த்தருக்குள் சந்தோஷம்.",
    keywords: ["joy", "rejoice", "glad", "சந்தோஷம்", "மகிழ்ச்சி"],
    verses: [
      { bookId: "philippians", chapter: 4, verse: 4 },
      { bookId: "nehemiah", chapter: 8, verse: 10 },
      { bookId: "psalms", chapter: 16, verse: 11 },
      { bookId: "john", chapter: 15, verse: 11 },
      { bookId: "romans", chapter: 15, verse: 13 },
    ],
  },
  {
    id: "patience",
    title: "Patience",
    titleTamil: "பொறுமை",
    summary: "Waiting on the Lord with a steady heart.",
    summaryTamil: "உறுதியான இருதயத்தோடு கர்த்தருக்காகக் காத்திருத்தல்.",
    keywords: ["patience", "wait", "endure", "longsuffering", "பொறுமை", "காத்திரு"],
    verses: [
      { bookId: "romans", chapter: 12, verse: 12 },
      { bookId: "james", chapter: 1, verse: 4 },
      { bookId: "psalms", chapter: 27, verse: 14 },
      { bookId: "galatians", chapter: 5, verse: 22 },
      { bookId: "hebrews", chapter: 10, verse: 36 },
    ],
  },
  {
    id: "gratitude",
    title: "Thanksgiving",
    titleTamil: "நன்றியறிதல்",
    summary: "Give thanks in all things.",
    summaryTamil: "எல்லாவற்றிலும் நன்றி செலுத்துங்கள்.",
    keywords: ["thanks", "thanksgiving", "grateful", "praise", "நன்றி", "ஸ்தோத்திரம்"],
    verses: [
      { bookId: "1-thessalonians", chapter: 5, verse: 18 },
      { bookId: "psalms", chapter: 100, verse: 4 },
      { bookId: "psalms", chapter: 107, verse: 1 },
      { bookId: "colossians", chapter: 3, verse: 17 },
      { bookId: "ephesians", chapter: 5, verse: 20 },
    ],
  },
  {
    id: "guidance",
    title: "Guidance",
    titleTamil: "வழிநடத்துதல்",
    summary: "Ask the Lord to direct your path.",
    summaryTamil: "உன் பாதையை நேராக்க கர்த்தரிடம் கேள்.",
    keywords: ["guide", "guidance", "direction", "path", "வழி", "நடத்து"],
    verses: [
      { bookId: "proverbs", chapter: 3, verse: 5 },
      { bookId: "psalms", chapter: 32, verse: 8 },
      { bookId: "isaiah", chapter: 30, verse: 21 },
      { bookId: "psalms", chapter: 119, verse: 105 },
      { bookId: "james", chapter: 1, verse: 5 },
    ],
  },
];

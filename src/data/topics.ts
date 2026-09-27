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
  verses: TopicVerse[];
}

export const BIBLE_TOPICS: BibleTopic[] = [
  {
    id: "faith",
    title: "Faith",
    titleTamil: "விசுவாசம்",
    verses: [
      { bookId: "hebrews", chapter: 11, verse: 1 },
      { bookId: "romans", chapter: 10, verse: 17 },
      { bookId: "mark", chapter: 11, verse: 22 },
      { bookId: "2-corinthians", chapter: 5, verse: 7 },
      { bookId: "james", chapter: 1, verse: 6 },
    ],
  },
  {
    id: "prayer",
    title: "Prayer",
    titleTamil: "ஜெபம்",
    verses: [
      { bookId: "philippians", chapter: 4, verse: 6 },
      { bookId: "matthew", chapter: 6, verse: 9 },
      { bookId: "1-thessalonians", chapter: 5, verse: 17 },
      { bookId: "jeremiah", chapter: 33, verse: 3 },
      { bookId: "james", chapter: 5, verse: 16 },
    ],
  },
  {
    id: "fear",
    title: "Fear not",
    titleTamil: "பயப்படாதே",
    verses: [
      { bookId: "isaiah", chapter: 41, verse: 10 },
      { bookId: "joshua", chapter: 1, verse: 9 },
      { bookId: "2-timothy", chapter: 1, verse: 7 },
      { bookId: "psalms", chapter: 27, verse: 1 },
      { bookId: "john", chapter: 14, verse: 27 },
    ],
  },
  {
    id: "peace",
    title: "Peace",
    titleTamil: "சமாதானம்",
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
    verses: [
      { bookId: "john", chapter: 3, verse: 16 },
      { bookId: "1-corinthians", chapter: 13, verse: 4 },
      { bookId: "1-john", chapter: 4, verse: 8 },
      { bookId: "romans", chapter: 5, verse: 8 },
      { bookId: "matthew", chapter: 22, verse: 37 },
    ],
  },
  {
    id: "strength",
    title: "Strength",
    titleTamil: "பெலன்",
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
    verses: [
      { bookId: "james", chapter: 5, verse: 14 },
      { bookId: "psalms", chapter: 103, verse: 3 },
      { bookId: "isaiah", chapter: 53, verse: 5 },
      { bookId: "jeremiah", chapter: 17, verse: 14 },
      { bookId: "exodus", chapter: 15, verse: 26 },
    ],
  },
  {
    id: "wisdom",
    title: "Wisdom",
    titleTamil: "ஞானம்",
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
    verses: [
      { bookId: "romans", chapter: 10, verse: 9 },
      { bookId: "ephesians", chapter: 2, verse: 8 },
      { bookId: "acts", chapter: 16, verse: 31 },
      { bookId: "john", chapter: 14, verse: 6 },
      { bookId: "romans", chapter: 6, verse: 23 },
    ],
  },
];

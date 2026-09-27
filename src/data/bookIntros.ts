/** Short offline book introductions (study aid, not Scripture). */

export interface BookIntro {
  bookId: string;
  titleEn: string;
  titleTa: string;
  bodyEn: string;
  bodyTa: string;
}

export const BOOK_INTROS: BookIntro[] = [
  {
    bookId: "genesis",
    titleEn: "Genesis",
    titleTa: "ஆதியாகமம்",
    bodyEn: "Beginnings — creation, the fall, and God’s promise to Abraham’s family.",
    bodyTa: "தொடக்கம் — சிருஷ்டி, விழுகை, ஆபிரகாமின் குடும்பத்திற்கு தேவனுடைய வாக்குத்தத்தம்.",
  },
  {
    bookId: "exodus",
    titleEn: "Exodus",
    titleTa: "யாத்திராகமம்",
    bodyEn: "God rescues Israel from Egypt and gives the law at Sinai.",
    bodyTa: "தேவன் இஸ்ரவேலை எகிப்திலிருந்து விடுவித்து சீனாயில் நியாயப்பிரமாணம் அருளுகிறார்.",
  },
  {
    bookId: "psalms",
    titleEn: "Psalms",
    titleTa: "சங்கீதம்",
    bodyEn: "Songs of worship, lament, and trust for every season of life.",
    bodyTa: "வாழ்க்கையின் ஒவ்வொரு காலத்திற்கும் ஆராதனை, புலம்பல், நம்பிக்கைப் பாடல்கள்.",
  },
  {
    bookId: "proverbs",
    titleEn: "Proverbs",
    titleTa: "நீதிமொழிகள்",
    bodyEn: "Wisdom for daily life — fear of the Lord is the beginning.",
    bodyTa: "நாளாந்த வாழ்க்கைக்கான ஞானம் — கர்த்தருக்குப் பயப்படுதலே ஆரம்பம்.",
  },
  {
    bookId: "isaiah",
    titleEn: "Isaiah",
    titleTa: "ஏசாயா",
    bodyEn: "Judgment and hope; prophecies of the coming Messiah.",
    bodyTa: "நியாயத்தீர்ப்பும் நம்பிக்கையும்; வரப்போகும் மேசியாவைப் பற்றிய தீர்க்கதரிசனங்கள்.",
  },
  {
    bookId: "matthew",
    titleEn: "Matthew",
    titleTa: "மத்தேயு",
    bodyEn: "Jesus the promised King — teaching, miracles, cross, and resurrection.",
    bodyTa: "வாக்குத்தத்தம் பண்ணப்பட்ட ராஜா இயேசு — போதனை, அற்புதங்கள், சிலுவை, உயிர்த்தெழுதல்.",
  },
  {
    bookId: "john",
    titleEn: "John",
    titleTa: "யோவான்",
    bodyEn: "Believe that Jesus is the Son of God and find life in His name.",
    bodyTa: "இயேசு தேவனுடைய குமாரன் என்று விசுவாசித்து அவருடைய நாமத்தில் ஜீவனைப் பெறுங்கள்.",
  },
  {
    bookId: "romans",
    titleEn: "Romans",
    titleTa: "ரோமர்",
    bodyEn: "The gospel explained — sin, grace, faith, and new life in Christ.",
    bodyTa: "சுவிசேஷ விளக்கம் — பாவம், கிருபை, விசுவாசம், கிறிஸ்துவுக்குள் புதிய ஜீவன்.",
  },
  {
    bookId: "ephesians",
    titleEn: "Ephesians",
    titleTa: "எபேசியர்",
    bodyEn: "Who we are in Christ and how the church walks in unity and love.",
    bodyTa: "கிறிஸ்துவுக்குள் நாம் யார், சபை எப்படி ஒற்றுமையிலும் அன்பிலும் நடக்கிறது.",
  },
  {
    bookId: "philippians",
    titleEn: "Philippians",
    titleTa: "பிலிப்பியர்",
    bodyEn: "Joy in Christ even in hardship — rejoice in the Lord always.",
    bodyTa: "கஷ்டத்திலும் கிறிஸ்துவுக்குள் சந்தோஷம் — எப்பொழுதும் கர்த்தருக்குள் சந்தோஷப்படுங்கள்.",
  },
  {
    bookId: "hebrews",
    titleEn: "Hebrews",
    titleTa: "எபிரெயர்",
    bodyEn: "Jesus is better — our great High Priest and the new covenant.",
    bodyTa: "இயேசு மேலானவர் — நமது மகா பிரதான ஆசாரியர் மற்றும் புதிய உடன்படிக்கை.",
  },
  {
    bookId: "revelation",
    titleEn: "Revelation",
    titleTa: "வெளிப்படுத்தல்",
    bodyEn: "Christ wins — hope for the church until He makes all things new.",
    bodyTa: "கிறிஸ்து ஜெயங்கொள்கிறார் — எல்லாவற்றையும் புதிதாக்கும் வரை சபைக்கு நம்பிக்கை.",
  },
];

export function getBookIntro(bookId: string): BookIntro | undefined {
  return BOOK_INTROS.find((item) => item.bookId === bookId);
}

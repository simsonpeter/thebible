export type StrongLanguage = "hebrew" | "greek";

export interface StrongEntry {
  id: string;
  language: StrongLanguage;
  lexeme: string;
  transliteration: string;
  pronunciation: string;
  shortDefinition: string;
  partOfSpeech: string;
  tamil: string;
  english: string;
  cognates: string[];
}

export interface StrongDictionaryFile {
  source: string;
  license: string;
  count: number;
  entries: StrongEntry[];
}

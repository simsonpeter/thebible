export type CommentaryBook = {
  id: string;
  pages: string[];
};

export type CommentaryFile = {
  source: string;
  license: string;
  title: string;
  titleEnglish: string;
  count: number;
  books: CommentaryBook[];
};

export type CommentaryEditionId = "brief" | "full";

export type CommentaryChapter = {
  id: string;
  pages: string[];
};

export type CommentaryBook = {
  id: string;
  /** Brief edition: flat page list. */
  pages?: string[];
  /** Full edition: section folder under the Tamil root. */
  section?: string;
  /** Full edition: chapter → scan pages. */
  chapters?: CommentaryChapter[];
};

export type CommentaryFile = {
  source: string;
  license: string;
  title: string;
  titleEnglish: string;
  count: number;
  rootFolder?: string;
  books: CommentaryBook[];
};

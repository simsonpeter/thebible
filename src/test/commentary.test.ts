import { describe, expect, it } from "vitest";
import {
  adjacentCommentaryBook,
  commentaryPageFallbackUrl,
  commentaryPageUrl,
  searchCommentaryBooks,
} from "@/services/commentaryService";
import type { CommentaryBook } from "@/types/commentary";

const books: CommentaryBook[] = [
  { id: "genesis", pages: ["ge1.jpg", "ge2.jpg"] },
  { id: "john", pages: ["joh1.jpg"] },
  { id: "acts", pages: ["act1.jpg"] },
];

describe("brief commentary", () => {
  it("builds encoded page URLs from the public source", () => {
    expect(commentaryPageUrl("joh1.jpg")).toContain("good-news-brief-commentary");
    expect(commentaryPageUrl("joh1.jpg")).toContain(encodeURIComponent("வேதாகமம்-சுருக்கவுரை"));
    expect(commentaryPageUrl("joh1.jpg")).toContain("joh1.jpg");
    expect(commentaryPageFallbackUrl("joh1.jpg")).toContain("raw.githubusercontent.com");
  });

  it("finds books by English or Tamil names", () => {
    expect(searchCommentaryBooks(books, "யோவான்").map((item) => item.id)).toEqual(["john"]);
    expect(searchCommentaryBooks(books, "genesis").map((item) => item.id)).toEqual(["genesis"]);
    expect(searchCommentaryBooks(books, "அப்போஸ்தலர்").map((item) => item.id)).toEqual(["acts"]);
  });

  it("moves to the next commentary book", () => {
    expect(adjacentCommentaryBook(books, "genesis", 1)?.id).toBe("john");
    expect(adjacentCommentaryBook(books, "acts", 1)).toBeUndefined();
  });
});

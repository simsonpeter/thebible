import { describe, expect, it } from "vitest";
import {
  adjacentCommentaryBook,
  adjacentCommentaryChapter,
  commentaryChapterLabel,
  commentaryPageFallbackUrl,
  commentaryPageUrl,
  resolveCommentaryRoute,
  searchCommentaryBooks,
} from "@/services/commentaryService";
import type { CommentaryBook } from "@/types/commentary";

const briefBooks: CommentaryBook[] = [
  { id: "genesis", pages: ["ge1.jpg", "ge2.jpg"] },
  { id: "john", pages: ["joh1.jpg"] },
  { id: "acts", pages: ["act1.jpg"] },
];

const fullBook: CommentaryBook = {
  id: "genesis",
  section: "1-பஞ்சாகமம்-விரிவுரை",
  chapters: [
    { id: "int", pages: ["gen 0.gif"] },
    { id: "1", pages: ["gen 1.gif", "gen 1-1.gif"] },
    { id: "2", pages: ["gen 2.gif"] },
  ],
};

describe("brief commentary", () => {
  it("builds encoded page URLs from the public source", () => {
    expect(commentaryPageUrl("brief", "joh1.jpg")).toContain("good-news-brief-commentary");
    expect(commentaryPageUrl("brief", "joh1.jpg")).toContain(encodeURIComponent("வேதாகமம்-சுருக்கவுரை"));
    expect(commentaryPageUrl("brief", "joh1.jpg")).toContain("joh1.jpg");
    expect(commentaryPageFallbackUrl("brief", "joh1.jpg")).toContain("raw.githubusercontent.com");
  });

  it("finds books by English or Tamil names", () => {
    expect(searchCommentaryBooks(briefBooks, "யோவான்").map((item) => item.id)).toEqual(["john"]);
    expect(searchCommentaryBooks(briefBooks, "genesis").map((item) => item.id)).toEqual(["genesis"]);
    expect(searchCommentaryBooks(briefBooks, "அப்போஸ்தலர்").map((item) => item.id)).toEqual(["acts"]);
  });

  it("moves to the next commentary book", () => {
    expect(adjacentCommentaryBook(briefBooks, "genesis", 1)?.id).toBe("john");
    expect(adjacentCommentaryBook(briefBooks, "acts", 1)).toBeUndefined();
  });
});

describe("full commentary", () => {
  it("builds section-scoped CDN URLs with encoded spaces", () => {
    const url = commentaryPageUrl("full", "gen 1-1.gif", "1-பஞ்சாகமம்-விரிவுரை");
    expect(url).toContain("good-news-tamil-bible-commentary");
    expect(url).toContain(encodeURIComponent("வேதாகமம்-விரிவுரை"));
    expect(url).toContain(encodeURIComponent("1-பஞ்சாகமம்-விரிவுரை"));
    expect(url).toContain(encodeURIComponent("gen 1-1.gif"));
    expect(commentaryPageFallbackUrl("full", "gen 1-1.gif", "1-பஞ்சாகமம்-விரிவுரை")).toContain(
      "raw.githubusercontent.com",
    );
  });

  it("moves between chapters including introduction", () => {
    expect(commentaryChapterLabel("int")).toBe("Introduction");
    expect(adjacentCommentaryChapter(fullBook, "int", 1)?.id).toBe("1");
    expect(adjacentCommentaryChapter(fullBook, "1", 1)?.id).toBe("2");
    expect(adjacentCommentaryChapter(fullBook, "2", 1)).toBeUndefined();
  });

  it("keeps legacy book routes on the brief edition", () => {
    expect(resolveCommentaryRoute({ edition: "john" })).toEqual({
      edition: "brief",
      bookId: "john",
      chapterId: undefined,
      legacyBook: "john",
    });
    expect(resolveCommentaryRoute({ edition: "full", book: "genesis", chapter: "1" })).toEqual({
      edition: "full",
      bookId: "genesis",
      chapterId: "1",
    });
  });
});

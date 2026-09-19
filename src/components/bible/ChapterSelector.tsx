import { useState } from "react";
import { getBookById } from "@/data/books";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/misc";

export function ChapterSelector({
  bookId,
  value,
  onChange,
  language,
}: {
  bookId: string;
  value: number;
  onChange: (chapter: number) => void;
  language: "en" | "ta";
}) {
  const [open, setOpen] = useState(false);
  const book = getBookById(bookId);
  const count = book?.chapterCount ?? 1;
  const bookName = language === "ta" ? book?.nameTamil : book?.nameEnglish;

  return (
    <>
      <button
        type="button"
        className="min-h-11 min-w-11 rounded-full border border-navy/10 bg-white px-3 text-sm font-semibold dark:border-white/10 dark:bg-white/5"
        onClick={() => setOpen(true)}
        aria-label="Choose chapter"
      >
        {value} ▼
      </button>
      <Modal open={open} title={`${bookName ?? "Chapter"}`} onClose={() => setOpen(false)}>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {Array.from({ length: count }, (_, index) => index + 1).map((chapter) => (
            <button
              key={chapter}
              type="button"
              className={cn(
                "min-h-11 rounded-2xl text-sm font-semibold",
                chapter === value ? "bg-navy text-white dark:bg-gold dark:text-navy-deep" : "bg-paper-2 dark:bg-white/5",
              )}
              onClick={() => {
                onChange(chapter);
                setOpen(false);
              }}
            >
              {chapter}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}

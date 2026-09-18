import { useState } from "react";
import { BOOK_CATALOG, ntBooks, otBooks } from "@/data/books";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/misc";

export function BookSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (bookId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [testament, setTestament] = useState<"OT" | "NT">(
    BOOK_CATALOG.find((book) => book.id === value)?.testament ?? "NT",
  );
  const book = BOOK_CATALOG.find((item) => item.id === value);
  const list = testament === "OT" ? otBooks() : ntBooks();

  return (
    <>
      <button
        type="button"
        className="min-h-11 rounded-full border border-navy/10 bg-white px-3 text-sm font-semibold dark:border-white/10 dark:bg-white/5"
        onClick={() => setOpen(true)}
        aria-label="Choose book"
      >
        {book ? (
          <span>
            <span className="tamil">{book.nameTamil}</span>
            <span className="mx-1 text-muted">▼</span>
          </span>
        ) : (
          "Book"
        )}
      </button>
      <Modal open={open} title="Books" onClose={() => setOpen(false)} wide>
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            className={cn("min-h-11 rounded-full px-4 text-sm", testament === "OT" ? "bg-navy text-white" : "bg-paper-2")}
            onClick={() => setTestament("OT")}
          >
            Old Testament
          </button>
          <button
            type="button"
            className={cn("min-h-11 rounded-full px-4 text-sm", testament === "NT" ? "bg-navy text-white" : "bg-paper-2")}
            onClick={() => setTestament("NT")}
          >
            New Testament
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {list.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "min-h-14 rounded-2xl px-3 py-2 text-left",
                item.id === value ? "bg-navy text-white dark:bg-gold dark:text-navy-deep" : "bg-paper-2 dark:bg-white/5",
              )}
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
            >
              <span className="tamil block text-sm">{item.nameTamil}</span>
              <span className="text-xs opacity-80">{item.nameEnglish}</span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}

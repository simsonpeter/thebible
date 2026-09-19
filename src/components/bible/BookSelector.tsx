import { useMemo, useState } from "react";
import { BOOK_CATALOG, ntBooks, otBooks } from "@/data/books";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/misc";

export function BookSelector({
  value,
  onChange,
  language,
}: {
  value: string;
  onChange: (bookId: string) => void;
  language: "en" | "ta";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [testament, setTestament] = useState<"OT" | "NT">(
    BOOK_CATALOG.find((book) => book.id === value)?.testament ?? "NT",
  );
  const book = BOOK_CATALOG.find((item) => item.id === value);
  const source = testament === "OT" ? otBooks() : ntBooks();
  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return source;
    return source.filter(
      (item) =>
        item.nameEnglish.toLowerCase().includes(needle) ||
        item.nameTamil.includes(query.trim()) ||
        item.id.includes(needle),
    );
  }, [query, source]);

  return (
    <>
      <button
        type="button"
        className="min-h-11 max-w-[12rem] rounded-full border border-navy/10 bg-white px-3 text-left text-sm dark:border-white/10 dark:bg-white/5"
        onClick={() => {
          setQuery("");
          setTestament(BOOK_CATALOG.find((item) => item.id === value)?.testament ?? "NT");
          setOpen(true);
        }}
        aria-label="Choose book"
      >
        {book ? (
          <span className="block truncate">
            <span className={cn("font-medium", language === "ta" && "tamil")}>
              {language === "ta" ? book.nameTamil : book.nameEnglish}
            </span>
            <span className="ml-1 text-muted">▼</span>
          </span>
        ) : (
          "Book"
        )}
      </button>
      <Modal open={open} title="Books" onClose={() => setOpen(false)} wide>
        <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-4 bg-paper px-5 pt-1 pb-3 dark:bg-[#12171e]">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={language === "ta" ? "மத்தேயு • யோவான்" : "Matthew • John"}
            className="mb-3 min-h-11 w-full rounded-full border border-navy/10 bg-white px-4 text-sm dark:border-white/10 dark:bg-white/5"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className={cn("min-h-11 flex-1 rounded-full px-4 text-sm", testament === "OT" ? "bg-navy text-white" : "bg-paper-2")}
              onClick={() => setTestament("OT")}
            >
              Old Testament
            </button>
            <button
              type="button"
              className={cn("min-h-11 flex-1 rounded-full px-4 text-sm", testament === "NT" ? "bg-navy text-white" : "bg-paper-2")}
              onClick={() => setTestament("NT")}
            >
              New Testament
            </button>
          </div>
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
              <span className={cn("block text-sm font-medium", language === "ta" && "tamil")}>
                {language === "ta" ? item.nameTamil : item.nameEnglish}
              </span>
            </button>
          ))}
        </div>
        {list.length === 0 ? <p className="py-8 text-center text-sm text-muted">No books match that search.</p> : null}
      </Modal>
    </>
  );
}

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/layout/Page";
import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { db } from "@/db";
import { deleteBookmark, updateBookmark } from "@/services/bookmarkService";
import { shareOrCopy } from "@/services/shareService";
import { formatRange } from "@/utils/reference";
import { translationUiLanguage } from "@/config/translations";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DEFAULT_BOOKMARK_CATEGORIES } from "@/types/userData";

export function BookmarksPage() {
  const rows = useLiveQuery(() => db.bookmarks.orderBy("createdAt").reverse().toArray(), []) ?? [];
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Favorites");
  const [customCategory, setCustomCategory] = useState("");
  const navigate = useNavigate();

  const categories = useMemo(() => {
    const extras = rows.map((row) => row.category).filter(Boolean);
    return ["All", "Tamil", "THNGV", "Tanglish", "English", ...new Set([...DEFAULT_BOOKMARK_CATEGORIES, ...extras])];
  }, [rows]);

  const visible = useMemo(() => {
    return rows.filter((row) => {
      if (filter === "Tamil") return row.translationId === "bsi-ov" || row.translationId === "thngv";
      if (filter === "THNGV") return row.translationId === "thngv";
      if (filter === "Tanglish") return row.translationId === "tanglish";
      if (filter === "English") return row.translationId === "kjv";
      if (filter === "All") return true;
      return row.category === filter;
    });
  }, [rows, filter]);

  return (
    <Page title="Bookmarks" back>
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={`min-h-11 rounded-full px-3 text-sm ${filter === item ? "bg-navy text-white" : "bg-paper-2 dark:bg-white/5"}`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-3">
        {visible.length === 0 ? <p className="text-sm text-muted">No bookmarks in this category.</p> : null}
        {visible.map((bookmark) => (
          <div key={bookmark.id}>
            <BookmarkCard
              bookmark={bookmark}
              onOpen={() =>
                navigate(
                  `/bible/${bookmark.bookId}/${bookmark.chapter}?verse=${bookmark.verseStart}&translation=${bookmark.translationId}`,
                )
              }
              onShare={() =>
                void shareOrCopy(
                  "NJC Bible App",
                  formatRange(
                    bookmark.bookId,
                    bookmark.chapter,
                    bookmark.verseStart,
                    bookmark.verseEnd,
                    translationUiLanguage(bookmark.translationId),
                  ),
                )
              }
              onDelete={() => bookmark.id && void deleteBookmark(bookmark.id)}
            />
            <button
              type="button"
              className="mt-1 min-h-11 px-2 text-sm font-semibold"
              onClick={() => {
                setEditing(bookmark.id ?? null);
                setTitle(bookmark.title);
                setCategory(bookmark.category);
              }}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
      <Modal open={editing !== null} title="Edit bookmark" onClose={() => setEditing(null)}>
        <input
          className="min-h-12 w-full rounded-2xl border border-navy/10 px-3 dark:bg-white/5"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="Bookmark title"
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {DEFAULT_BOOKMARK_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className={`min-h-11 rounded-2xl text-sm ${category === item ? "bg-navy text-white" : "bg-paper-2 dark:bg-white/5"}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <input
          className="mt-3 min-h-12 w-full rounded-2xl border border-navy/10 px-3 dark:bg-white/5"
          placeholder="Custom category"
          value={customCategory}
          onChange={(event) => {
            setCustomCategory(event.target.value);
            if (event.target.value.trim()) setCategory(event.target.value.trim());
          }}
          aria-label="Custom category"
        />
        <Button
          className="mt-3 w-full"
          onClick={() => {
            if (editing) void updateBookmark(editing, { title, category });
            setEditing(null);
          }}
        >
          Save
        </Button>
      </Modal>
    </Page>
  );
}

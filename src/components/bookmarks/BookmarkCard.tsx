import { formatRange } from "@/utils/reference";
import type { BookmarkRecord } from "@/types/userData";
import { Card } from "@/components/ui/Card";

export function BookmarkCard({
  bookmark,
  onOpen,
  onShare,
  onDelete,
}: {
  bookmark: BookmarkRecord;
  onOpen: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <p className="text-xs tracking-wide text-gold uppercase">{bookmark.category}</p>
      <h3 className="mt-1 font-semibold">{bookmark.title}</h3>
      <p className="text-sm text-muted">
        {formatRange(bookmark.bookId, bookmark.chapter, bookmark.verseStart, bookmark.verseEnd)}
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="min-h-11 rounded-full px-3 text-sm font-semibold" onClick={onOpen}>
          Open
        </button>
        <button type="button" className="min-h-11 rounded-full px-3 text-sm font-semibold" onClick={onShare}>
          Share
        </button>
        <button type="button" className="min-h-11 rounded-full px-3 text-sm font-semibold text-red-700" onClick={onDelete}>
          Delete
        </button>
      </div>
    </Card>
  );
}

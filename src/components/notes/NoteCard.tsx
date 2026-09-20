import type { NoteRecord } from "@/types/userData";
import { formatReference } from "@/utils/reference";
import { isTamilScript, translationUiLanguage } from "@/config/translations";
import { formatDisplayDate } from "@/utils/misc";
import { Card } from "@/components/ui/Card";

export function NoteCard({
  note,
  onOpen,
  onEdit,
  onDelete,
}: {
  note: NoteRecord;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <p className={isTamilScript(note.translationId) ? "tamil text-sm font-semibold" : "text-sm font-semibold"}>
        {formatReference(note.bookId, note.chapter, note.verseNumber, translationUiLanguage(note.translationId))}
      </p>
      <p className="mt-2 whitespace-pre-wrap">{note.text}</p>
      <p className="mt-2 text-xs text-muted">{formatDisplayDate(note.updatedAt)}</p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="min-h-11 rounded-full px-3 text-sm font-semibold" onClick={onOpen}>
          Open
        </button>
        <button type="button" className="min-h-11 rounded-full px-3 text-sm font-semibold" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="min-h-11 rounded-full px-3 text-sm font-semibold text-red-700" onClick={onDelete}>
          Delete
        </button>
      </div>
    </Card>
  );
}

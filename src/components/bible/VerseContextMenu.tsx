import { BottomSheet } from "@/components/ui/BottomSheet";
import { HIGHLIGHT_COLORS } from "@/services/highlightService";
import type { HighlightColor } from "@/types/userData";

const actions = [
  { id: "copy", label: "Copy" },
  { id: "share", label: "Share" },
  { id: "bookmark", label: "Bookmark" },
  { id: "note", label: "Add Note" },
  { id: "sermon", label: "Add to sermon" },
  { id: "compare", label: "Compare" },
  { id: "search", label: "Search" },
  { id: "image", label: "Verse Image" },
] as const;

export type VerseAction = (typeof actions)[number]["id"] | "highlight";

export function VerseContextMenu({
  open,
  reference,
  onClose,
  onAction,
  onHighlight,
}: {
  open: boolean;
  reference: string;
  onClose: () => void;
  onAction: (action: Exclude<VerseAction, "highlight">) => void;
  onHighlight: (color: HighlightColor) => void;
}) {
  return (
    <BottomSheet open={open} title={reference} onClose={onClose}>
      <div className="mb-4 flex flex-wrap gap-2" aria-label="Highlight color">
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Highlight ${color}`}
            className="min-h-11 min-w-11 rounded-full border border-navy/10 capitalize"
            style={{ background: color }}
            onClick={() => onHighlight(color)}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="min-h-12 rounded-2xl bg-paper-2 px-3 text-sm font-semibold dark:bg-white/5"
            onClick={() => onAction(action.id)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

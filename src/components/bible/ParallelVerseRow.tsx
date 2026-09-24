import type { VerseRecord } from "@/types/bible";
import { DEMO_BANNER } from "@/data/licenses";
import { isTamilScript, translationLabel } from "@/config/translations";
import { cn } from "@/utils/misc";

export function ParallelVerseRow({
  number,
  byId,
  translationIds,
  layout,
  showNumber,
  selected,
  speaking,
  onActivate,
  onLongPress,
}: {
  number: number;
  byId: Record<string, VerseRecord | undefined>;
  translationIds: string[];
  layout: "stacked" | "columns";
  showNumber: boolean;
  selected?: boolean;
  speaking?: boolean;
  onActivate: () => void;
  onLongPress: () => void;
}) {
  return (
    <article
      id={`v-${number}`}
      className={cn(
        "rounded-2xl p-2",
        selected && "ring-2 ring-gold/70",
        speaking && "bg-gold-soft/50 ring-2 ring-gold dark:bg-gold/15",
      )}
      style={{ marginBottom: "var(--verse-gap)" }}
      onClick={onActivate}
      onContextMenu={(event) => {
        event.preventDefault();
        onLongPress();
      }}
    >
      {showNumber ? <p className="mb-1 text-sm font-semibold text-gold">{number}</p> : null}
      <div
        className={cn(
          "grid gap-3",
          layout === "columns" && translationIds.length === 2 && "md:grid-cols-2",
          layout === "columns" && translationIds.length >= 3 && "md:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {translationIds.map((id) => {
          const verse = byId[id];
          const tamil = isTamilScript(id);
          return (
            <div key={id}>
              <p className="mb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">{translationLabel(id)}</p>
              <p
                className={cn(
                  "verse-text",
                  tamil ? "tamil" : "english-serif",
                  verse?.isPlaceholder && "italic text-muted",
                )}
                style={{
                  fontSize: tamil ? "var(--tamil-size)" : "var(--english-size)",
                  lineHeight: "var(--verse-leading)",
                }}
              >
                {verse?.text ?? `${translationLabel(id)} is not available for this verse.`}
                {verse?.isPlaceholder ? ` • ${DEMO_BANNER}` : ""}
              </p>
            </div>
          );
        })}
      </div>
    </article>
  );
}

import type { VerseRecord } from "@/types/bible";
import { DEMO_BANNER } from "@/data/licenses";
import { cn } from "@/utils/misc";

export function ParallelVerseRow({
  number,
  tamil,
  english,
  order,
  layout,
  showNumber,
  selected,
  onActivate,
  onLongPress,
}: {
  number: number;
  tamil?: VerseRecord;
  english?: VerseRecord;
  order: "tamil-first" | "english-first";
  layout: "stacked" | "columns";
  showNumber: boolean;
  selected?: boolean;
  onActivate: () => void;
  onLongPress: () => void;
}) {
  const blocks = [
    { key: "ta", label: "BSI OV Tamil", verse: tamil, language: "ta" as const },
    { key: "en", label: "KJV English", verse: english, language: "en" as const },
  ];
  if (order === "english-first") blocks.reverse();

  return (
    <article
      id={`v-${number}`}
      className={cn("rounded-2xl p-2", selected && "ring-2 ring-gold/70")}
      style={{ marginBottom: "var(--verse-gap)" }}
      onClick={onActivate}
      onContextMenu={(event) => {
        event.preventDefault();
        onLongPress();
      }}
    >
      {showNumber ? <p className="mb-1 text-sm font-semibold text-gold">{number}</p> : null}
      <div className={cn(layout === "columns" ? "grid gap-4 md:grid-cols-2" : "grid gap-2")}>
        {blocks.map((block) => (
          <div key={block.key}>
            <p className="mb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">{block.label}</p>
            <p
              className={cn(
                "verse-text",
                block.language === "ta" ? "tamil" : "english-serif",
                block.verse?.isPlaceholder && "italic text-muted",
              )}
              style={{
                fontSize: block.language === "ta" ? "var(--tamil-size)" : "var(--english-size)",
                lineHeight: "var(--verse-leading)",
              }}
            >
              {block.verse?.text ??
                (block.key === "ta"
                  ? "BSI Tamil O.V. Bible data has not been installed."
                  : "This verse is not available.")}
              {block.verse?.isPlaceholder ? ` • ${DEMO_BANNER}` : ""}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

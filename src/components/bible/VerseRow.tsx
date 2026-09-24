import type { HighlightColor } from "@/types/userData";
import type { VerseRecord } from "@/types/bible";
import { cn } from "@/utils/misc";

const highlightClass: Record<HighlightColor, string> = {
  yellow: "bg-yellow-200/80 dark:bg-yellow-400/25",
  green: "bg-emerald-200/80 dark:bg-emerald-400/20",
  blue: "bg-sky-200/80 dark:bg-sky-400/20",
  pink: "bg-pink-200/80 dark:bg-pink-400/20",
  orange: "bg-orange-200/80 dark:bg-orange-400/20",
};

export function VerseRow({
  verse,
  showNumber,
  language,
  highlight,
  selected,
  speaking,
  continuous,
  serif,
  onActivate,
  onLongPress,
}: {
  verse: VerseRecord;
  showNumber: boolean;
  language: "en" | "ta";
  highlight?: HighlightColor;
  selected?: boolean;
  speaking?: boolean;
  continuous?: boolean;
  serif?: boolean;
  onActivate: () => void;
  onLongPress: () => void;
}) {
  return (
    <p
      id={`v-${verse.number}`}
      className={cn(
        "verse-text rounded-2xl px-1",
        language === "ta" ? "tamil" : "",
        serif && language === "ta" && "tamil-serif",
        serif && language === "en" && "english-serif",
        highlight && highlightClass[highlight],
        selected && "ring-2 ring-gold/70",
        speaking && "bg-gold-soft/50 ring-2 ring-gold dark:bg-gold/15",
        continuous ? "inline" : "block",
      )}
      style={{
        fontSize: language === "ta" ? "var(--tamil-size)" : "var(--english-size)",
        lineHeight: "var(--verse-leading)",
        marginBottom: continuous ? undefined : "var(--verse-gap)",
      }}
      onClick={onActivate}
      onContextMenu={(event) => {
        event.preventDefault();
        onLongPress();
      }}
      onTouchStart={(event) => {
        const target = event.currentTarget;
        const timer = window.setTimeout(onLongPress, 500);
        const cancel = () => window.clearTimeout(timer);
        target.addEventListener("touchend", cancel, { once: true });
        target.addEventListener("touchmove", cancel, { once: true });
      }}
    >
      {showNumber ? (
        <sup className="mr-1 select-none text-xs font-semibold text-gold">{verse.number}</sup>
      ) : null}
      <span className={verse.isPlaceholder ? "italic text-muted dark:text-white/50" : ""}>{verse.text}</span>
    </p>
  );
}

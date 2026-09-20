import { cn } from "@/utils/misc";
import { TRANSLATION_OPTIONS } from "@/config/translations";

export function TranslationSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <label className="block">
      <span className="sr-only">Translation</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-full border border-navy/10 bg-white px-3 text-sm font-semibold dark:border-white/10 dark:bg-white/5"
      >
        {TRANSLATION_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ModeToggle({
  value,
  onChange,
}: {
  value: "single" | "parallel";
  onChange: (mode: "single" | "parallel") => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-navy/8 p-1 dark:bg-white/10" role="group" aria-label="Reading mode">
      {(["single", "parallel"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          className={cn(
            "min-h-10 rounded-full px-3 text-xs font-semibold tracking-wide uppercase",
            value === mode ? "bg-navy text-white dark:bg-gold dark:text-navy-deep" : "text-muted",
          )}
          onClick={() => onChange(mode)}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}

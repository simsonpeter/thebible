import { cn } from "@/utils/misc";
import { translationsByLanguage } from "@/config/translations";

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
        {translationsByLanguage().map((group) => (
          <optgroup key={group.id} label={group.label}>
            {group.options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

export function TranslationLanguagePicker({
  selected,
  onSelect,
  order = "tamil-first",
}: {
  selected: readonly string[] | string;
  onSelect: (id: string) => void;
  order?: "tamil-first" | "english-first";
}) {
  const active = new Set(typeof selected === "string" ? [selected] : selected);
  return (
    <div className="grid gap-3" aria-label="Bibles by language">
      {translationsByLanguage(order).map((group) => (
        <div key={group.id} className="flex flex-wrap items-center gap-2">
          <p className="w-full text-xs uppercase tracking-[0.2em] text-gold">{group.label}</p>
          {group.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={cn(
                "min-h-11 rounded-full px-3 text-sm",
                active.has(option.id) ? "bg-navy text-white dark:bg-gold dark:text-navy-deep" : "bg-paper-2 dark:bg-white/5",
              )}
              onClick={() => onSelect(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ))}
    </div>
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

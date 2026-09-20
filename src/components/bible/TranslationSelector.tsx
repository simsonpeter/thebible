import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/misc";
import {
  translationLanguage,
  translationsByLanguage,
  type TranslationLanguage,
} from "@/config/translations";

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

const SHORT_LANGUAGE_LABEL: Record<TranslationLanguage, string> = {
  ta: "Tamil",
  tl: "Tanglish",
  en: "English",
  nl: "Dutch",
};

export function TranslationLanguagePicker({
  selected,
  onSelect,
  order = "tamil-first",
  compact = false,
}: {
  selected: readonly string[] | string;
  onSelect: (id: string) => void;
  order?: "tamil-first" | "english-first";
  compact?: boolean;
}) {
  const groups = translationsByLanguage(order);
  const active = useMemo(
    () => new Set(typeof selected === "string" ? [selected] : selected),
    [selected],
  );
  const selectedId = typeof selected === "string" ? selected : selected[0] ?? groups[0]?.options[0]?.id ?? "kjv";
  const [language, setLanguage] = useState<TranslationLanguage>(() => translationLanguage(selectedId));

  useEffect(() => {
    setLanguage(translationLanguage(selectedId));
  }, [selectedId]);

  const activeLanguage = groups.some((group) => group.id === language)
    ? language
    : translationLanguage(selectedId);
  const visible = groups.find((group) => group.id === activeLanguage) ?? groups[0];

  if (compact) {
    return (
      <div className="grid gap-2" aria-label="Bibles by language">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Language">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={group.id === activeLanguage}
              className={cn(
                "min-h-9 rounded-full px-3 text-xs font-semibold",
                group.id === activeLanguage
                  ? "bg-navy text-white dark:bg-gold dark:text-navy-deep"
                  : "bg-paper-2 text-muted dark:bg-white/5",
              )}
              onClick={() => setLanguage(group.id)}
            >
              {SHORT_LANGUAGE_LABEL[group.id]}
            </button>
          ))}
        </div>
        {visible ? (
          <div className="flex flex-wrap gap-1.5" role="tabpanel" aria-label={visible.label}>
            {visible.options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={cn(
                  "min-h-9 rounded-full px-3 text-sm",
                  active.has(option.id)
                    ? "bg-navy text-white dark:bg-gold dark:text-navy-deep"
                    : "bg-paper-2 dark:bg-white/5",
                )}
                onClick={() => {
                  setLanguage(option.language);
                  onSelect(option.id);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-3" aria-label="Bibles by language">
      {groups.map((group) => (
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

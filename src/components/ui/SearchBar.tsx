import { cn } from "@/utils/misc";

export function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{placeholder}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "min-h-12 w-full rounded-2xl border border-navy/10 bg-white px-4 text-base outline-none ring-gold/40 focus:ring-2 dark:border-white/10 dark:bg-white/5",
        )}
      />
    </label>
  );
}

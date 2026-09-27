import { cn } from "@/utils/misc";

export function SearchBar({
  value,
  onChange,
  placeholder,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onSubmit?: () => void;
}) {
  return (
    <label className="block">
      <span className="sr-only">{placeholder}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit?.();
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "min-h-12 w-full rounded-2xl border border-navy/10 bg-white px-4 text-base outline-none ring-gold/40 focus:ring-2 dark:border-white/10 dark:bg-white/5",
        )}
      />
    </label>
  );
}

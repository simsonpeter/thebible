import type { StrongEntry } from "@/types/strongs";

export function DictionaryEntryCard({
  entry,
  expanded,
  onOpen,
  onCognate,
}: {
  entry: StrongEntry;
  expanded?: boolean;
  onOpen: () => void;
  onCognate?: (id: string) => void;
}) {
  return (
    <article className="rounded-3xl bg-white/80 p-4 dark:bg-white/5">
      <button type="button" className="w-full text-left" onClick={onOpen}>
        <p className="text-xs tracking-[0.2em] text-gold uppercase">
          {entry.id} · {entry.language === "hebrew" ? "Hebrew" : "Greek"}
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          {entry.lexeme}{" "}
          <span className="text-base font-normal text-muted">{entry.transliteration}</span>
        </h2>
        <p className="mt-1 text-sm font-semibold">{entry.shortDefinition}</p>
        {entry.partOfSpeech ? <p className="mt-1 text-xs text-muted">{entry.partOfSpeech}</p> : null}
        <p className="tamil mt-2 text-sm leading-relaxed">{expanded ? entry.tamil : snippet(entry.tamil)}</p>
      </button>
      {expanded ? (
        <div className="mt-3 grid gap-3 text-sm leading-relaxed">
          {entry.pronunciation ? <p className="text-muted">{entry.pronunciation}</p> : null}
          {entry.english ? <p>{entry.english}</p> : null}
          {entry.cognates.length ? (
            <div className="flex flex-wrap gap-2">
              {entry.cognates.slice(0, 24).map((id) => (
                <button
                  key={id}
                  type="button"
                  className="min-h-10 rounded-full bg-paper-2 px-3 text-xs font-semibold dark:bg-white/5"
                  onClick={() => onCognate?.(id)}
                >
                  {id}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function snippet(text: string): string {
  const line = text.split("\n").find((item) => item.trim()) ?? text;
  return line.length > 140 ? `${line.slice(0, 137).trim()}…` : line;
}

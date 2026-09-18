import type { SearchHit } from "@/services/searchService";
import { formatReference } from "@/utils/reference";
import { escapeRegExp } from "@/utils/text";

export function SearchResult({
  hit,
  query,
  onOpen,
}: {
  hit: SearchHit;
  query: string;
  onOpen: () => void;
}) {
  const language = hit.verse.translationId === "bsi-ov" ? "ta" : "en";
  return (
    <button type="button" className="w-full rounded-3xl bg-white/80 p-4 text-left dark:bg-white/5" onClick={onOpen}>
      <p className="text-sm font-semibold">
        {formatReference(hit.verse.bookId, hit.verse.chapter, hit.verse.number, language)}
        <span className="ml-2 text-xs text-gold">{hit.verse.translationId === "kjv" ? "KJV" : "தமிழ் O.V."}</span>
      </p>
      <p className={language === "ta" ? "tamil mt-2 text-sm" : "mt-2 text-sm"}>{highlightNodes(hit.snippet, query)}</p>
    </button>
  );
}

function highlightNodes(text: string, query: string) {
  const needle = query.trim().replace(/^["“]|["”]$/g, "");
  if (needle.length < 2) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(needle)})`, "ig"));
  return parts.map((part, index) =>
    part.toLowerCase() === needle.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded bg-gold/50 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

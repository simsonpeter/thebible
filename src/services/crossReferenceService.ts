import { CROSS_REFERENCE_MAP, crossRefKey, type CrossRefTarget } from "@/data/crossReferences";
import { formatReference } from "@/utils/reference";

export type { CrossRefTarget };

export function getCrossReferences(bookId: string, chapter: number, verse: number): CrossRefTarget[] {
  return CROSS_REFERENCE_MAP[crossRefKey(bookId, chapter, verse)] ?? [];
}

export function formatCrossRef(target: CrossRefTarget, language: "en" | "ta" = "en"): string {
  return formatReference(target.bookId, target.chapter, target.verse, language);
}

export function crossRefPath(target: CrossRefTarget, translationId?: string): string {
  const params = new URLSearchParams();
  params.set("verse", String(target.verse));
  if (translationId) params.set("translation", translationId);
  return `/bible/${target.bookId}/${target.chapter}?${params.toString()}`;
}

/** Follow the cross-ref trail, skipping verses already visited in this chain. */
export function getNextCrossReference(
  bookId: string,
  chapter: number,
  verse: number,
  visited: string[] = [],
): CrossRefTarget | null {
  const refs = getCrossReferences(bookId, chapter, verse);
  const next = refs.find((item) => !visited.includes(`${item.bookId}:${item.chapter}:${item.verse}`));
  return next ?? null;
}

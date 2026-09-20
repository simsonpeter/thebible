export type TranslationLanguage = "ta" | "tl" | "en";

export const TRANSLATION_OPTIONS = [
  { id: "bsi-ov", label: "தமிழ் O.V.", language: "ta" },
  { id: "thngv", label: "THNGV", language: "ta" },
  { id: "tanglish", label: "Tanglish", language: "tl" },
  { id: "kjv", label: "English KJV", language: "en" },
] as const;

export const TRANSLATION_LANGUAGE_GROUPS = [
  { id: "ta", label: "Tamil · தமிழ்" },
  { id: "tl", label: "Tanglish" },
  { id: "en", label: "English" },
] as const;

export function translationLanguage(translationId: string): TranslationLanguage {
  const option = TRANSLATION_OPTIONS.find((item) => item.id === translationId);
  if (option) return option.language;
  return isTamilScript(translationId) ? "ta" : "en";
}

export function translationsByLanguage(
  order: "tamil-first" | "english-first" = "tamil-first",
): Array<{ id: TranslationLanguage; label: string; options: Array<(typeof TRANSLATION_OPTIONS)[number]> }> {
  const groups = TRANSLATION_LANGUAGE_GROUPS.map((group) => ({
    ...group,
    options: TRANSLATION_OPTIONS.filter((option) => option.language === group.id),
  }));
  if (order === "english-first") {
    return [...groups.filter((group) => group.id === "en"), ...groups.filter((group) => group.id !== "en")];
  }
  return groups;
}

export function isTamilScript(translationId: string): boolean {
  return translationId === "bsi-ov" || translationId === "thngv";
}

export function translationUiLanguage(translationId: string): "en" | "ta" {
  return isTamilScript(translationId) ? "ta" : "en";
}

export function translationLabel(translationId: string): string {
  if (translationId === "bsi-ov") return "Tamil O.V.";
  if (translationId === "thngv") return "THNGV";
  if (translationId === "tanglish") return "Tanglish";
  if (translationId === "kjv") return "KJV";
  return TRANSLATION_OPTIONS.find((option) => option.id === translationId)?.label ?? translationId;
}

export function toggleParallelTranslation(current: readonly string[], id: string): string[] {
  if (current.includes(id)) {
    return current.length <= 2 ? [...current] : current.filter((item) => item !== id);
  }
  return [...current, id];
}

export function resolveParallelSelection(
  selected: readonly string[] | undefined,
  available: readonly string[],
  order: "tamil-first" | "english-first" = "tamil-first",
): string[] {
  const pool = available.length ? available : TRANSLATION_OPTIONS.map((option) => option.id as string);
  const wanted = (selected ?? []).filter((id) => pool.includes(id));
  const next = [...wanted];
  for (const id of orderParallelTranslations(pool, order)) {
    if (next.length >= 2) break;
    if (!next.includes(id)) next.push(id);
  }
  return orderParallelTranslations(next, order);
}

export function orderParallelTranslations(
  ids: readonly string[],
  order: "tamil-first" | "english-first" = "tamil-first",
): string[] {
  const catalog = translationsByLanguage(order).flatMap((group) => group.options.map((option) => option.id as string));
  const known = catalog.filter((id) => ids.includes(id));
  const extra = ids.filter((id) => !known.includes(id));
  return [...known, ...extra];
}

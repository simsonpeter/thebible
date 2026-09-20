export const TRANSLATION_OPTIONS = [
  { id: "bsi-ov", label: "தமிழ் O.V." },
  { id: "tanglish", label: "Tanglish" },
  { id: "kjv", label: "English KJV" },
] as const;

export function isTamilScript(translationId: string): boolean {
  return translationId === "bsi-ov";
}

export function translationUiLanguage(translationId: string): "en" | "ta" {
  return translationId === "bsi-ov" ? "ta" : "en";
}

export function translationLabel(translationId: string): string {
  if (translationId === "bsi-ov") return "Tamil O.V.";
  if (translationId === "tanglish") return "Tanglish";
  if (translationId === "kjv") return "KJV";
  return TRANSLATION_OPTIONS.find((option) => option.id === translationId)?.label ?? translationId;
}

export function orderParallelTranslations(
  ids: readonly string[],
  order: "tamil-first" | "english-first" = "tamil-first",
): string[] {
  const catalog = TRANSLATION_OPTIONS.map((option) => option.id as string);
  const known = catalog.filter((id) => ids.includes(id));
  const extra = ids.filter((id) => !known.includes(id));
  const ordered = [...known, ...extra];
  if (order === "english-first") {
    return [...ordered.filter((id) => id === "kjv"), ...ordered.filter((id) => id !== "kjv")];
  }
  if (order === "tamil-first") {
    return [...ordered.filter((id) => id === "bsi-ov"), ...ordered.filter((id) => id !== "bsi-ov")];
  }
  return ordered;
}

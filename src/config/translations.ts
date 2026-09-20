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

/**
 * Developer-supplied licensing text for bundled/imported Bibles.
 * Do not invent BSI permission language. Fill these fields from the
 * authorized dataset you legally obtained.
 */
export const bibleLicenses = {
  kjv: {
    id: "kjv",
    name: "King James Version",
    abbreviation: "KJV",
    language: "en" as const,
    copyrightText: "Public Domain",
    permissionText:
      "The King James Version is in the public domain. NJC Bible App bundles a local public-domain KJV file and does not download it from the internet at runtime.",
    publisherText: "Public-domain KJV text, 1769 Oxford edition wording.",
  },
  bsiOv: {
    id: "bsi-ov",
    name: "BSI Tamil O.V. (New Ortho)",
    abbreviation: "BSI O.V.",
    language: "ta" as const,
    copyrightText: "",
    permissionText: "",
    publisherText: "",
  },
};

export function bsiNoticeFromConfig(): string {
  const { copyrightText, permissionText, publisherText, name } = bibleLicenses.bsiOv;
  const parts = [name, copyrightText, permissionText, publisherText].filter((part) => part.trim());
  if (parts.length <= 1) {
    return `${name} is not bundled. Import an authorized dataset, then add the copyright/permission notice supplied with that dataset in src/config/bibleLicenses.ts.`;
  }
  return parts.join("\n\n");
}

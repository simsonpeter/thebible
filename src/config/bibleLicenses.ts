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
    name: "Tamil Bible (Old Version)",
    abbreviation: "தமிழ் O.V.",
    language: "ta" as const,
    copyrightText: "Classic Tamil Old Version. Not BSI Tamil O.V. New Ortho.",
    permissionText:
      "Packaged from the per-book JSON files in https://github.com/aruljohn/Bible-tamil. That repository's MIT license covers the packaging, not a named publisher grant for BSI New Ortho. The wording is classic Tamil Old Version (pre-New Ortho). The 1957 Bible Society of India and Ceylon Tamil Old Version is documented as public domain in India. NJC Bible App does not present this text as authorized BSI New Ortho.",
    publisherText: "Source files: Arul John, Bible-tamil. Scripture wording: classic Tamil Old Version.",
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

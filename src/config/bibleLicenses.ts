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
  tanglish: {
    id: "tanglish",
    name: "Tanglish Bible",
    abbreviation: "Tanglish",
    language: "en" as const,
    copyrightText: "Tamil Romanised Bible (TAMRB). Packaged from a public Bible-module collection.",
    permissionText:
      "Romanized Tamil (Tanglish) wording from TAMRB / Tamil Romanised Bible 2019 modules in https://github.com/yesudas/all-bible-databases (Tanglish folder). That repository describes the databases as publicly available and free to reuse in apps. This is a Latin-script rendering of classic Tamil Bible wording, not authorized BSI Tamil O.V. New Ortho.",
    publisherText:
      "https://github.com/yesudas/all-bible-databases/tree/main/Bibles/Tamil-Bible-Database-and-Software-Modules/Tanglish",
  },
  thngv: {
    id: "thngv",
    name: "Hebrew Names of God Version (Tamil)",
    abbreviation: "THNGV",
    language: "ta" as const,
    copyrightText: "Public Domain. Not BSI Tamil O.V. New Ortho.",
    permissionText:
      "Hebrew Names of God Version in Tamil (THNGV) from https://github.com/yesudas/tamil-bible-hebrew-names-of-god-version. Restored and edited by Pastor Paul Jonathan. The base Tamil wording is the Henry Bower translation published in 1871. Hebrew names of God are restored in Tamil and English. The repository states this edition is public domain, may be copied and shared unchanged, and may not be sold. NJC Bible App does not present this text as authorized BSI New Ortho.",
    publisherText: "Pastor Paul Jonathan & Word of God Team. https://github.com/yesudas/tamil-bible-hebrew-names-of-god-version",
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

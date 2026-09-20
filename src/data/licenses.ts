import { bibleLicenses, bsiNoticeFromConfig } from "@/config/bibleLicenses";

export const APP_VERSION = "1.0.0";
export const APP_NAME = "NJC Bible App";

export const LICENSES = {
  app: {
    name: APP_NAME,
    version: APP_VERSION,
    privacy: "Reading works offline without an account. If you sign in, notes, bookmarks, highlights, sermons, reading history, and reading plans sync through the same NJC Firebase account used by the church app.",
    analytics: false,
    advertising: false,
  },
  kjv: {
    id: bibleLicenses.kjv.id,
    name: bibleLicenses.kjv.name,
    abbreviation: bibleLicenses.kjv.abbreviation,
    language: bibleLicenses.kjv.language,
    year: 1769,
    license: bibleLicenses.kjv.copyrightText,
    licenseDetails: bibleLicenses.kjv.permissionText,
    source: bibleLicenses.kjv.publisherText,
  },
  bsiOv: {
    id: bibleLicenses.bsiOv.id,
    name: bibleLicenses.bsiOv.name,
    abbreviation: bibleLicenses.bsiOv.abbreviation,
    language: bibleLicenses.bsiOv.language,
    license: bibleLicenses.bsiOv.copyrightText,
    licenseDetails: bsiNoticeFromConfig(),
    source: bibleLicenses.bsiOv.publisherText,
    year: 1957,
    copyrightHolder: bibleLicenses.bsiOv.publisherText || undefined,
  },
  tanglish: {
    id: bibleLicenses.tanglish.id,
    name: bibleLicenses.tanglish.name,
    abbreviation: bibleLicenses.tanglish.abbreviation,
    language: bibleLicenses.tanglish.language,
    license: bibleLicenses.tanglish.copyrightText,
    licenseDetails: bibleLicenses.tanglish.permissionText,
    source: bibleLicenses.tanglish.publisherText,
    year: 2019,
  },
};

export const DEMO_PLACEHOLDER = "[Licensed Bible text required]";
export const DEMO_BANNER = "DEMO BIBLE DATA";

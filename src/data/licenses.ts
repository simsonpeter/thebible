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
  thngv: {
    id: bibleLicenses.thngv.id,
    name: bibleLicenses.thngv.name,
    abbreviation: bibleLicenses.thngv.abbreviation,
    language: bibleLicenses.thngv.language,
    license: bibleLicenses.thngv.copyrightText,
    licenseDetails: bibleLicenses.thngv.permissionText,
    source: bibleLicenses.thngv.publisherText,
    year: 2026,
  },
  sv: {
    id: bibleLicenses.sv.id,
    name: bibleLicenses.sv.name,
    abbreviation: bibleLicenses.sv.abbreviation,
    language: bibleLicenses.sv.language,
    license: bibleLicenses.sv.copyrightText,
    licenseDetails: bibleLicenses.sv.permissionText,
    source: bibleLicenses.sv.publisherText,
    year: 1637,
  },
  strongs: {
    name: "Strong Dictionary",
    abbreviation: "Hebrew/Greek",
    license: "Public-domain Tamil Strong's wording. MIT covers the source repository packaging.",
    licenseDetails:
      "Hebrew and Greek Strong's definitions in Tamil from https://github.com/yesudas/strongs-dictionary-in-tamil. The 1890 Strong's dictionaries are public domain. The Tamil translation is credited to Tamil Good News Publishers / Bell Wether International (Arulappan) and was digitized by Yesudas Solomon and Mathanraj (Joshua). That repository states the work is freely given (Matthew 10:8) and is MIT-licensed. NJC Bible App bundles the MyBible TStrongs module for offline lookup. This is a study aid, not Scripture, and is not a BSI publication.",
    source: "https://github.com/yesudas/strongs-dictionary-in-tamil",
    year: 1890,
  },
  commentary: {
    name: "Good News Brief Commentary",
    abbreviation: "வேதாகமம் சுருக்கவுரை",
    license: "Public domain per Matthew 10:8. MIT covers the source repository packaging.",
    licenseDetails:
      "Tamil brief commentary (வேதாகமம் சுருக்கவுரை) from https://github.com/yesudas/good-news-brief-commentary. Published by Tamil Good News Publishers / Bell Wether International (Arulappan) and hosted by Word of God Team. That repository states the work is public domain as per Matthew 10:8 and is MIT-licensed for packaging. NJC Bible App opens the original page scans by book. This is a study aid, not Scripture, and is not a BSI publication.",
    source: "https://github.com/yesudas/good-news-brief-commentary",
    year: 2025,
  },
};

export const DEMO_PLACEHOLDER = "[Licensed Bible text required]";
export const DEMO_BANNER = "DEMO BIBLE DATA";

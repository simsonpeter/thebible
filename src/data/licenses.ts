import { bibleLicenses, bsiNoticeFromConfig } from "@/config/bibleLicenses";

export const APP_VERSION = "1.0.0";
export const APP_NAME = "NJC Bible App";

export const LICENSES = {
  app: {
    name: APP_NAME,
    version: APP_VERSION,
    privacy: "Your Bible reading data is stored locally on this device.",
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
    license: bibleLicenses.bsiOv.copyrightText || "Not bundled. Import an authorized dataset.",
    licenseDetails: bsiNoticeFromConfig(),
    source: "Not included. Provide an authorized JSON, CSV, or TXT import.",
    copyrightHolder: bibleLicenses.bsiOv.publisherText || undefined,
  },
};

export const DEMO_PLACEHOLDER = "[Licensed Bible text required]";
export const DEMO_BANNER = "DEMO BIBLE DATA";

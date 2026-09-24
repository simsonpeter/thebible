import { describe, expect, it } from "vitest";
import {
  clampRate,
  pickVoice,
  preferredSpeechLang,
  speechLangTags,
  voiceMatchScore,
} from "@/services/ttsService";

describe("tts language tags", () => {
  it("prefers Tamil India for Tamil script translations", () => {
    expect(preferredSpeechLang("bsi-ov")).toBe("ta-IN");
    expect(preferredSpeechLang("thngv")).toBe("ta-IN");
    expect(speechLangTags("bsi-ov")[0]).toBe("ta-IN");
  });

  it("uses English voices for Tanglish and KJV", () => {
    expect(preferredSpeechLang("tanglish")).toBe("en-IN");
    expect(preferredSpeechLang("kjv")).toBe("en-US");
  });

  it("uses Dutch for Statenvertaling", () => {
    expect(preferredSpeechLang("sv")).toBe("nl-NL");
  });
});

describe("pickVoice", () => {
  const voices = [
    { lang: "en-US", name: "Samantha", localService: true },
    { lang: "ta-IN", name: "Google தமிழ்", localService: false },
    { lang: "ta-IN", name: "Microsoft Tamil Neural", localService: true },
    { lang: "nl-NL", name: "Xander", localService: true },
  ];

  it("picks a Tamil voice for bsi-ov", () => {
    const voice = pickVoice(voices, "bsi-ov");
    expect(voice?.lang).toBe("ta-IN");
    expect(voice?.name).toContain("Tamil");
  });

  it("returns null when no language match exists", () => {
    expect(pickVoice([{ lang: "fr-FR", name: "Thomas", localService: true }], "bsi-ov")).toBeNull();
  });

  it("scores exact lang higher than primary-only", () => {
    const exact = voiceMatchScore({ lang: "ta-IN", name: "A", localService: false }, ["ta-IN", "ta"]);
    const primary = voiceMatchScore({ lang: "ta", name: "B", localService: false }, ["ta-IN", "ta"]);
    expect(exact).toBeGreaterThan(primary);
  });
});

describe("clampRate", () => {
  it("keeps rates in a safe speech range", () => {
    expect(clampRate(1)).toBe(1);
    expect(clampRate(0.2)).toBe(0.6);
    expect(clampRate(3)).toBe(1.5);
    expect(clampRate(Number.NaN)).toBe(1);
  });
});

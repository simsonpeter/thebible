import { translationLanguage, type TranslationLanguage } from "@/config/translations";

/** BCP-47 tags preferred for Web Speech. */
const LANG_TAGS: Record<TranslationLanguage, string[]> = {
  ta: ["ta-IN", "ta"],
  tl: ["en-IN", "en-GB", "en-US", "en"],
  en: ["en-US", "en-GB", "en-IN", "en"],
  nl: ["nl-NL", "nl-BE", "nl"],
};

export function speechLangTags(translationId: string): string[] {
  return LANG_TAGS[translationLanguage(translationId)] ?? LANG_TAGS.en;
}

export function preferredSpeechLang(translationId: string): string {
  return speechLangTags(translationId)[0] ?? "en-US";
}

/** Score how well a voice matches the requested language tags (higher is better). */
export function voiceMatchScore(voice: { lang: string; name: string; localService: boolean }, tags: string[]): number {
  const lang = voice.lang.toLowerCase();
  let score = 0;
  for (let i = 0; i < tags.length; i += 1) {
    const tag = tags[i]!.toLowerCase();
    const primary = tag.split("-")[0]!;
    if (lang === tag) score = Math.max(score, 100 - i * 5);
    else if (lang.startsWith(`${primary}-`) || lang === primary) score = Math.max(score, 70 - i * 5);
  }
  if (score === 0) return 0;
  if (voice.localService) score += 8;
  // Prefer natural / neural / premium Tamil or Indian voices when present.
  const name = voice.name.toLowerCase();
  if (/(neural|natural|premium|enhanced|google|microsoft)/.test(name)) score += 4;
  if (/tamil|india|indi/.test(name)) score += 3;
  return score;
}

export function pickVoice(
  voices: Array<{ lang: string; name: string; localService: boolean }>,
  translationId: string,
): (typeof voices)[number] | null {
  const tags = speechLangTags(translationId);
  let best: (typeof voices)[number] | null = null;
  let bestScore = 0;
  for (const voice of voices) {
    const score = voiceMatchScore(voice, tags);
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

export function getSpeechVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices();
}

/** Wait briefly for Chrome's async voice list if empty on first call. */
export function loadSpeechVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSynthesisSupported()) return Promise.resolve([]);
  const existing = window.speechSynthesis.getVoices();
  if (existing.length) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    window.setTimeout(done, 750);
  });
}

export interface SpeakOptions {
  text: string;
  translationId: string;
  rate?: number;
  voice?: SpeechSynthesisVoice | null;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

export function speakUtterance(options: SpeakOptions): SpeechSynthesisUtterance | null {
  if (!isSpeechSynthesisSupported() || !options.text.trim()) return null;
  const utterance = new SpeechSynthesisUtterance(options.text);
  utterance.lang = preferredSpeechLang(options.translationId);
  utterance.rate = clampRate(options.rate ?? 1);
  if (options.voice) utterance.voice = options.voice;
  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = () => options.onError?.();
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function cancelSpeech(): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
}

export function pauseSpeech(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  try {
    window.speechSynthesis.pause();
    return window.speechSynthesis.paused;
  } catch {
    return false;
  }
}

export function resumeSpeech(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  try {
    window.speechSynthesis.resume();
    return window.speechSynthesis.speaking && !window.speechSynthesis.paused;
  } catch {
    return false;
  }
}

export function clampRate(rate: number): number {
  if (!Number.isFinite(rate)) return 1;
  return Math.min(1.5, Math.max(0.6, rate));
}

export const TTS_RATE_OPTIONS = [
  { value: 0.75, label: "Slow" },
  { value: 1, label: "Normal" },
  { value: 1.2, label: "Fast" },
] as const;

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelSpeech,
  clampRate,
  isSpeechSynthesisSupported,
  loadSpeechVoices,
  pauseSpeech,
  pickVoice,
  resumeSpeech,
  speakUtterance,
} from "@/services/ttsService";

export type BibleAudioStatus = "idle" | "playing" | "paused" | "unsupported";

export interface AudioVerse {
  number: number;
  text: string;
  translationId: string;
}

interface UseBibleAudioOptions {
  /** Stable key for the current chapter (e.g. `bsi-ov:john:3`). Stops playback when it changes, unless auto-next is pending. */
  chapterKey: string;
  verses: AudioVerse[];
  rate?: number;
  /**
   * Called when the last verse finishes. Return true if navigation to the next chapter was started
   * so playback can continue once the new verses load.
   */
  onChapterEnd?: () => boolean;
}

export function useBibleAudio({ chapterKey, verses, rate = 1, onChapterEnd }: UseBibleAudioOptions) {
  const [status, setStatus] = useState<BibleAudioStatus>(() =>
    isSpeechSynthesisSupported() ? "idle" : "unsupported",
  );
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);

  const versesRef = useRef(verses);
  const rateRef = useRef(clampRate(rate));
  const onChapterEndRef = useRef(onChapterEnd);
  const indexRef = useRef(0);
  const activeRef = useRef(false);
  const generationRef = useRef(0);
  const pendingContinueRef = useRef(false);
  const continueTargetKeyRef = useRef<string | null>(null);

  versesRef.current = verses;
  rateRef.current = clampRate(rate);
  onChapterEndRef.current = onChapterEnd;

  const stopInternal = useCallback((next: BibleAudioStatus = "idle") => {
    generationRef.current += 1;
    activeRef.current = false;
    pendingContinueRef.current = false;
    continueTargetKeyRef.current = null;
    cancelSpeech();
    setCurrentVerse(null);
    setStatus((prev) => (prev === "unsupported" ? prev : next));
  }, []);

  const speakAt = useCallback(async (index: number) => {
    const list = versesRef.current;
    if (!list.length || index < 0 || index >= list.length) {
      if (list.length && index >= list.length && onChapterEndRef.current) {
        pendingContinueRef.current = true;
        continueTargetKeyRef.current = null;
        setCurrentVerse(null);
        setStatus("playing");
        const continued = onChapterEndRef.current();
        if (!continued) {
          pendingContinueRef.current = false;
          continueTargetKeyRef.current = null;
          activeRef.current = false;
          setStatus("idle");
        }
        return;
      }
      activeRef.current = false;
      pendingContinueRef.current = false;
      continueTargetKeyRef.current = null;
      setCurrentVerse(null);
      setStatus("idle");
      return;
    }

    const verse = list[index]!;
    if (!verse.text.trim() || verse.text.startsWith("[")) {
      indexRef.current = index + 1;
      void speakAt(index + 1);
      return;
    }

    const gen = generationRef.current;
    const voices = await loadSpeechVoices();
    if (gen !== generationRef.current) return;

    const voice = pickVoice(voices, verse.translationId) as SpeechSynthesisVoice | null;
    setVoiceHint(voice?.name ?? null);
    indexRef.current = index;
    activeRef.current = true;
    setCurrentVerse(verse.number);
    setStatus("playing");

    speakUtterance({
      text: verse.text,
      translationId: verse.translationId,
      rate: rateRef.current,
      voice,
      onEnd: () => {
        if (gen !== generationRef.current || !activeRef.current) return;
        void speakAt(index + 1);
      },
      onError: () => {
        if (gen !== generationRef.current) return;
        activeRef.current = false;
        pendingContinueRef.current = false;
        setStatus("idle");
        setCurrentVerse(null);
      },
    });
  }, []);

  const play = useCallback(
    (fromVerse?: number) => {
      if (!isSpeechSynthesisSupported()) {
        setStatus("unsupported");
        return;
      }
      const list = versesRef.current;
      if (!list.length) return;

      let index = 0;
      if (fromVerse != null) {
        const found = list.findIndex((item) => item.number === fromVerse);
        index = found >= 0 ? found : 0;
      }

      generationRef.current += 1;
      pendingContinueRef.current = false;
      cancelSpeech();
      activeRef.current = true;
      void speakAt(index);
    },
    [speakAt],
  );

  const pause = useCallback(() => {
    if (status !== "playing") return;
    if (pauseSpeech()) {
      setStatus("paused");
      return;
    }
    cancelSpeech();
    setStatus("paused");
  }, [status]);

  const resume = useCallback(() => {
    if (status !== "paused") return;
    if (resumeSpeech() && window.speechSynthesis.speaking) {
      setStatus("playing");
      return;
    }
    const verseNumber = currentVerse ?? versesRef.current[indexRef.current]?.number;
    play(verseNumber);
  }, [status, currentVerse, play]);

  const stop = useCallback(() => stopInternal("idle"), [stopInternal]);

  const toggle = useCallback(() => {
    if (status === "playing") pause();
    else if (status === "paused") resume();
    else play();
  }, [status, pause, resume, play]);

  // Stop on chapter change unless auto-next is waiting for the next chapter's verses.
  useEffect(() => {
    if (pendingContinueRef.current) {
      continueTargetKeyRef.current = chapterKey;
      return;
    }
    stopInternal("idle");
  }, [chapterKey, stopInternal]);

  // Resume at verse 1 once the next chapter's verses are ready (empty list means still loading).
  const verseSignature = `${chapterKey}:${verses.length}:${verses[0]?.number ?? 0}:${verses[verses.length - 1]?.number ?? 0}`;
  useEffect(() => {
    if (!pendingContinueRef.current) return;
    if (!verses.length) return;
    if (continueTargetKeyRef.current !== chapterKey) return;
    pendingContinueRef.current = false;
    continueTargetKeyRef.current = null;
    generationRef.current += 1;
    activeRef.current = true;
    void speakAt(0);
  }, [verseSignature, verses.length, chapterKey, speakAt]);

  useEffect(() => () => stopInternal("idle"), [stopInternal]);

  useEffect(() => {
    if (status !== "playing" || !("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | undefined;
    let cancelled = false;
    void navigator.wakeLock
      .request("screen")
      .then((lock) => {
        if (cancelled) void lock.release();
        else sentinel = lock;
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      void sentinel?.release();
    };
  }, [status]);

  return {
    status,
    currentVerse,
    voiceHint,
    supported: status !== "unsupported",
    play,
    pause,
    resume,
    stop,
    toggle,
  };
}

export const SLEEP_TIMER_OPTIONS = [
  { minutes: 0, label: "Off" },
  { minutes: 15, label: "15m" },
  { minutes: 30, label: "30m" },
  { minutes: 45, label: "45m" },
  { minutes: 60, label: "60m" },
] as const;

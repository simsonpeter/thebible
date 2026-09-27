import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import {
  canvasToBlob,
  renderVerseImage,
  shareVerseImage,
  type VerseImageTemplate,
} from "@/services/verseImage";
import { getDailyVersePair } from "@/services/dailyVerse";
import { useToast } from "@/hooks/useToast";
import { shareOrCopy } from "@/services/shareService";

const templates: VerseImageTemplate[] = [
  "promise",
  "sunrise",
  "sky",
  "nature",
  "mountains",
  "church",
  "dark",
  "minimal",
  "gradient",
  "elegant",
];

interface VerseState {
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  language: "en" | "ta";
  template?: VerseImageTemplate;
  eyebrow?: string;
}

export function VerseImagePage() {
  const location = useLocation();
  const incoming = location.state as VerseState | null;
  const { push } = useToast();
  const [verse, setVerse] = useState<VerseState | null>(incoming);
  const [template, setTemplate] = useState<VerseImageTemplate>(incoming?.template ?? "promise");
  const [fontSize, setFontSize] = useState(incoming?.language === "ta" ? 40 : 46);
  const [align, setAlign] = useState<CanvasTextAlign>("center");
  const [preview, setPreview] = useState<string>("");
  const eyebrow = verse?.eyebrow ?? (template === "promise" ? "Promise of the day" : undefined);

  useEffect(() => {
    if (verse) return;
    void getDailyVersePair().then((pair) => {
      const daily = pair.tamil ?? pair.english;
      if (!daily) return;
      setVerse({
        bookId: daily.bookId,
        chapter: daily.chapter,
        verse: daily.number,
        text: daily.text,
        language: pair.tamil ? "ta" : "en",
        template: "promise",
        eyebrow: "Promise of the day",
      });
      setTemplate("promise");
      setFontSize(pair.tamil ? 40 : 46);
    });
  }, [verse]);

  useEffect(() => {
    if (!verse) return;
    let url = "";
    void renderVerseImage({
      ...verse,
      template,
      fontSize,
      align,
      eyebrow,
    }).then((canvas) => {
      url = canvas.toDataURL("image/png");
      setPreview(url);
    });
    return () => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [verse, template, fontSize, align, eyebrow]);

  async function download() {
    if (!verse) return;
    const canvas = await renderVerseImage({ ...verse, template, fontSize, align, eyebrow });
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `njc-bible-${verse.bookId}-${verse.chapter}-${verse.verse}.png`;
    anchor.click();
    URL.revokeObjectURL(url);
    push("Image downloaded", "success");
  }

  async function share() {
    if (!verse) return;
    try {
      const result = await shareVerseImage({ ...verse, template, fontSize, align, eyebrow });
      if (result === "downloaded") push("Image saved — open it to share", "success");
      else push("Shared", "success");
    } catch {
      await shareOrCopy("NJC Bible App", verse.text);
      push("Sharing is not available; verse copied instead.", "info");
    }
  }

  return (
    <Page title="Verse image" subtitle="Promise cards created on this device" back>
      <div className="mb-4 flex flex-wrap gap-2">
        {templates.map((item) => (
          <button
            key={item}
            type="button"
            className={`min-h-11 rounded-full px-3 capitalize ${template === item ? "bg-navy text-white" : "bg-paper-2 dark:bg-white/5"}`}
            onClick={() => setTemplate(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <label className="mb-4 block text-sm">
        Text size
        <input
          type="range"
          min={32}
          max={64}
          value={fontSize}
          onChange={(event) => setFontSize(Number(event.target.value))}
          className="mt-2 w-full"
        />
      </label>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Text alignment">
        {(["left", "center", "right"] as CanvasTextAlign[]).map((item) => (
          <button
            key={item}
            type="button"
            className={`min-h-11 rounded-full px-3 capitalize ${align === item ? "bg-navy text-white" : "bg-paper-2 dark:bg-white/5"}`}
            onClick={() => setAlign(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {preview ? (
        <img src={preview} alt="Generated verse image" className="w-full rounded-3xl border border-navy/10" />
      ) : (
        <p>Preparing image…</p>
      )}
      <div className="mt-4 flex gap-2">
        <Button className="flex-1" onClick={() => void download()}>
          Download
        </Button>
        <Button className="flex-1" variant="secondary" onClick={() => void share()}>
          Share
        </Button>
      </div>
    </Page>
  );
}

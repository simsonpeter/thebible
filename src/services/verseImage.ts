import { formatReference } from "@/utils/reference";

export type VerseImageTemplate =
  | "minimal"
  | "dark"
  | "nature"
  | "sky"
  | "mountains"
  | "sunrise"
  | "church"
  | "gradient"
  | "elegant";

export interface VerseImageOptions {
  template: VerseImageTemplate;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  language: "en" | "ta";
  fontSize: number;
  align?: CanvasTextAlign;
  width?: number;
  height?: number;
}

const TEMPLATES: Record<VerseImageTemplate, { background: string; text: string; muted: string; accent: string }> = {
  minimal: { background: "#f7f3eb", text: "#12263a", muted: "#6b6258", accent: "#c6a35a" },
  dark: { background: "#0c1016", text: "#f5f1ea", muted: "#c6a35a", accent: "#c6a35a" },
  nature: { background: "#173f2e", text: "#f7fff8", muted: "#d9f0dc", accent: "#f2e4b0" },
  sky: { background: "#4c7ea8", text: "#f7fbff", muted: "#d7e8f7", accent: "#ffe7b3" },
  mountains: { background: "#3a4454", text: "#f4f1ea", muted: "#c9c3b5", accent: "#e0c48a" },
  sunrise: { background: "#c46a3a", text: "#fffaf3", muted: "#ffe1c4", accent: "#ffe9a8" },
  church: { background: "#1b2430", text: "#f7f3eb", muted: "#c6a35a", accent: "#c6a35a" },
  gradient: { background: "#12263a", text: "#fffaf1", muted: "#e8d5a3", accent: "#e8d5a3" },
  elegant: { background: "#12263a", text: "#f7f3eb", muted: "#c6a35a", accent: "#c6a35a" },
};

function fillBackground(
  ctx: CanvasRenderingContext2D,
  template: VerseImageTemplate,
  width: number,
  height: number,
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  if (template === "nature") {
    gradient.addColorStop(0, "#245c40");
    gradient.addColorStop(1, "#0e2a22");
  } else if (template === "sky") {
    gradient.addColorStop(0, "#8ec5ea");
    gradient.addColorStop(1, "#355f86");
  } else if (template === "mountains") {
    gradient.addColorStop(0, "#6b7c91");
    gradient.addColorStop(1, "#2c3340");
  } else if (template === "sunrise") {
    gradient.addColorStop(0, "#f2c48a");
    gradient.addColorStop(1, "#b24a2c");
  } else if (template === "gradient") {
    gradient.addColorStop(0, "#12263a");
    gradient.addColorStop(1, "#8a6a32");
  } else if (template === "church") {
    gradient.addColorStop(0, "#243044");
    gradient.addColorStop(1, "#121820");
  } else {
    ctx.fillStyle = TEMPLATES[template].background;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function renderVerseImage(options: VerseImageOptions): Promise<HTMLCanvasElement> {
  await document.fonts.ready;
  const width = options.width ?? 1080;
  const height = options.height ?? 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  const theme = TEMPLATES[options.template];
  fillBackground(ctx, options.template, width, height);
  const align = options.align ?? "left";
  ctx.textAlign = align;
  const x = align === "center" ? width / 2 : align === "right" ? width - 90 : 90;

  if (options.template === "elegant" || options.template === "church") {
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 6;
    ctx.strokeRect(48, 48, width - 96, height - 96);
  }

  const reference = formatReference(options.bookId, options.chapter, options.verse, options.language);
  const fontFamily =
    options.language === "ta"
      ? '"Noto Sans Tamil", "Nirmala UI", sans-serif'
      : '"Source Serif 4", Georgia, serif';

  ctx.fillStyle = theme.muted;
  ctx.font = `28px Inter, sans-serif`;
  ctx.fillText("NJC Bible App", x, 140);

  ctx.fillStyle = theme.accent;
  ctx.font = `36px Inter, sans-serif`;
  ctx.fillText(reference, x, 210);

  ctx.fillStyle = theme.text;
  ctx.font = `${options.fontSize}px ${fontFamily}`;
  const lines = wrapText(ctx, options.text, width - 180);
  let y = 320;
  for (const line of lines.slice(0, 18)) {
    ctx.fillText(line, x, y);
    y += options.fontSize * 1.45;
  }

  ctx.fillStyle = theme.muted;
  ctx.font = `24px Inter, sans-serif`;
  ctx.fillText("Created locally on this device", x, height - 90);
  return canvas;
}

export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Could not create image."));
      else resolve(blob);
    }, "image/png");
  });
}

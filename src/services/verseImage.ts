import { formatReference } from "@/utils/reference";

export type VerseImageTemplate =
  | "promise"
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
  /** Small label above the reference, e.g. "Promise of the day". */
  eyebrow?: string;
}

const TEMPLATES: Record<VerseImageTemplate, { background: string; text: string; muted: string; accent: string }> = {
  promise: { background: "#1a3350", text: "#fff8ee", muted: "#e8d5a3", accent: "#f0d48a" },
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
  if (template === "promise") {
    paintPromiseBackground(ctx, width, height);
    return;
  }
  if (template === "sunrise") {
    paintSunriseBackground(ctx, width, height);
    return;
  }
  if (template === "sky") {
    paintSkyBackground(ctx, width, height);
    return;
  }
  if (template === "nature") {
    paintNatureBackground(ctx, width, height);
    return;
  }
  if (template === "mountains") {
    paintMountainsBackground(ctx, width, height);
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  if (template === "gradient") {
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

function paintPromiseBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#2a4a6e");
  sky.addColorStop(0.45, "#1a3350");
  sky.addColorStop(1, "#0f1f33");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Soft sun glow
  const glow = ctx.createRadialGradient(width * 0.72, height * 0.22, 20, width * 0.72, height * 0.22, width * 0.55);
  glow.addColorStop(0, "rgba(255, 214, 140, 0.55)");
  glow.addColorStop(0.35, "rgba(230, 170, 80, 0.18)");
  glow.addColorStop(1, "rgba(26, 51, 80, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Distant hills
  ctx.fillStyle = "#152a42";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.72);
  ctx.quadraticCurveTo(width * 0.25, height * 0.62, width * 0.5, height * 0.7);
  ctx.quadraticCurveTo(width * 0.75, height * 0.78, width, height * 0.66);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#0d1a2b";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.82);
  ctx.quadraticCurveTo(width * 0.35, height * 0.74, width * 0.65, height * 0.84);
  ctx.quadraticCurveTo(width * 0.85, height * 0.9, width, height * 0.8);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Light rays
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#ffe7b3";
  for (let i = 0; i < 7; i += 1) {
    const angle = -0.55 + i * 0.18;
    ctx.beginPath();
    ctx.moveTo(width * 0.72, height * 0.18);
    ctx.lineTo(width * 0.72 + Math.cos(angle) * width, height * 0.18 + Math.sin(angle) * height);
    ctx.lineTo(width * 0.72 + Math.cos(angle + 0.08) * width, height * 0.18 + Math.sin(angle + 0.08) * height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Vignette
  const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.2, width / 2, height / 2, height * 0.75);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function paintSunriseBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#f7d9a8");
  sky.addColorStop(0.4, "#e8955a");
  sky.addColorStop(1, "#7a2f28");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const sun = ctx.createRadialGradient(width / 2, height * 0.55, 10, width / 2, height * 0.55, width * 0.35);
  sun.addColorStop(0, "rgba(255, 240, 200, 0.9)");
  sun.addColorStop(0.4, "rgba(255, 180, 90, 0.35)");
  sun.addColorStop(1, "rgba(180, 60, 40, 0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(60, 30, 40, 0.45)";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.78);
  ctx.quadraticCurveTo(width * 0.4, height * 0.7, width, height * 0.8);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();
}

function paintSkyBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#b9dff7");
  sky.addColorStop(0.55, "#5a92bf");
  sky.addColorStop(1, "#2a5078");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.28)";
  drawCloud(ctx, width * 0.2, height * 0.22, 90);
  drawCloud(ctx, width * 0.7, height * 0.18, 120);
  drawCloud(ctx, width * 0.45, height * 0.3, 70);
}

function paintNatureBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#9fd0b5");
  sky.addColorStop(0.4, "#2f6b4d");
  sky.addColorStop(1, "#0f2a22");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#1a4a36";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.68);
  ctx.quadraticCurveTo(width * 0.3, height * 0.58, width * 0.55, height * 0.7);
  ctx.quadraticCurveTo(width * 0.8, height * 0.8, width, height * 0.65);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();

  ctx.fillStyle = "#0d2a20";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.85);
  ctx.quadraticCurveTo(width * 0.5, height * 0.75, width, height * 0.88);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();
}

function paintMountainsBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#d7e0ec");
  sky.addColorStop(0.45, "#6b7c91");
  sky.addColorStop(1, "#2a303c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#5a687a";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.7);
  ctx.lineTo(width * 0.28, height * 0.42);
  ctx.lineTo(width * 0.5, height * 0.68);
  ctx.lineTo(width * 0.72, height * 0.38);
  ctx.lineTo(width, height * 0.66);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();

  ctx.fillStyle = "#3a4454";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.82);
  ctx.lineTo(width * 0.35, height * 0.55);
  ctx.lineTo(width * 0.58, height * 0.8);
  ctx.lineTo(width * 0.85, height * 0.52);
  ctx.lineTo(width, height * 0.78);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  ctx.arc(x, y, size * 0.45, 0, Math.PI * 2);
  ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.35, 0, Math.PI * 2);
  ctx.arc(x + size * 0.75, y + size * 0.05, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x + size * 0.35, y + size * 0.2, size * 0.38, 0, Math.PI * 2);
  ctx.fill();
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
  const align = options.align ?? (options.template === "promise" ? "center" : "left");
  ctx.textAlign = align;
  const x = align === "center" ? width / 2 : align === "right" ? width - 90 : 90;

  // Soft card panel for readability on scenic backgrounds
  if (options.template === "promise" || options.template === "sunrise" || options.template === "sky" || options.template === "nature" || options.template === "mountains") {
    ctx.fillStyle = "rgba(10, 18, 30, 0.38)";
    roundRect(ctx, 64, 160, width - 128, height - 320, 36);
    ctx.fill();
  }

  if (options.template === "elegant" || options.template === "church" || options.template === "promise") {
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = options.template === "promise" ? 3 : 6;
    ctx.globalAlpha = options.template === "promise" ? 0.7 : 1;
    ctx.strokeRect(48, 48, width - 96, height - 96);
    ctx.globalAlpha = 1;
  }

  const reference = formatReference(options.bookId, options.chapter, options.verse, options.language);
  const fontFamily =
    options.language === "ta"
      ? '"Noto Sans Tamil", "Nirmala UI", sans-serif'
      : '"Source Serif 4", Georgia, serif';

  let y = 220;
  ctx.fillStyle = theme.muted;
  ctx.font = `600 26px Inter, sans-serif`;
  const eyebrow = options.eyebrow ?? (options.template === "promise" ? "Promise of the day" : "NJC Bible App");
  ctx.fillText(eyebrow.toUpperCase(), x, y);

  y += 70;
  ctx.fillStyle = theme.accent;
  ctx.font = `600 40px Inter, sans-serif`;
  ctx.fillText(reference, x, y);

  y += 90;
  ctx.fillStyle = theme.text;
  ctx.font = `${options.fontSize}px ${fontFamily}`;
  const lines = wrapText(ctx, options.text, width - 220);
  for (const line of lines.slice(0, 16)) {
    ctx.fillText(line, x, y);
    y += options.fontSize * 1.45;
  }

  ctx.fillStyle = theme.muted;
  ctx.font = `24px Inter, sans-serif`;
  ctx.fillText("NJC Bible App", x, height - 90);
  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Could not create image."));
      else resolve(blob);
    }, "image/png");
  });
}

export async function shareVerseImage(options: VerseImageOptions): Promise<"shared" | "downloaded" | "copied"> {
  const canvas = await renderVerseImage(options);
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], "njc-promise.png", { type: "image/png" });
  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: options.eyebrow ?? "NJC Bible App",
        text: `${formatReference(options.bookId, options.chapter, options.verse, options.language)}\n${options.text}`,
      });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "shared";
    }
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `njc-bible-${options.bookId}-${options.chapter}-${options.verse}.png`;
  anchor.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const svg = resolve(root, "public/favicon.svg");
const outDir = resolve(root, "public/icons");
mkdirSync(outDir, { recursive: true });

const jobs = [
  { file: resolve(outDir, "icon-192.png"), size: 192 },
  { file: resolve(outDir, "icon-512.png"), size: 512 },
  { file: resolve(outDir, "apple-touch-icon.png"), size: 180 },
  { file: resolve(root, "public/favicon.png"), size: 64 },
];

for (const job of jobs) {
  await sharp(svg).resize(job.size, job.size).png().toFile(job.file);
  console.log(`Wrote ${job.file}`);
}

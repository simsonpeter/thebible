import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

function copyBibleDataPlugin(): Plugin {
  const from = fileURLToPath(new URL("./bible-data", import.meta.url));
  const to = fileURLToPath(new URL("./public/bible-data", import.meta.url));
  const copy = () => {
    if (!existsSync(from)) return;
    mkdirSync(to, { recursive: true });
    cpSync(from, to, { recursive: true });
  };
  return {
    name: "copy-bible-data",
    buildStart() {
      copy();
    },
  };
}

const base = process.env.BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [
    copyBibleDataPlugin(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "favicon.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/apple-touch-icon.png",
        "bible-data/kjv/kjv.json",
        "bible-data/bsi-ov/bsi-ov.json",
        "bible-data/bsi-ov/sample.json",
        "bible-data/tanglish/tanglish.json",
        "data/kjv-source.json",
        "data/bsi-ov.sample.json",
        "data/licenses.json",
      ],
      manifest: {
        name: "NJC Bible App",
        short_name: "NJC Bible",
        description:
          "Offline-first Tamil and English Bible reader for BSI OV and KJV.",
        theme_color: "#12263a",
        background_color: "#f7f3eb",
        display: "standalone",
        orientation: "any",
        start_url: "./",
        scope: "./",
        lang: "en",
        categories: ["books", "education"],
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,png,woff,woff2,json,webmanifest}"],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /\/(data|bible-data)\/.*\.json$/,
            handler: "CacheFirst",
            options: {
              cacheName: "njc-bible-data",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
    {
      name: "spa-github-pages-404",
      closeBundle() {
        const index = fileURLToPath(new URL("./dist/index.html", import.meta.url));
        if (existsSync(index)) {
          copyFileSync(index, fileURLToPath(new URL("./dist/404.html", import.meta.url)));
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

import { DEFAULT_SETTINGS, type AppSettings } from "@/types/settings";
import { db } from "@/db";

const SETTINGS_KEY = "app";
const THEME_STORAGE_KEY = "njc-theme";

export async function loadSettings(): Promise<AppSettings> {
  const row = await db.settings.get(SETTINGS_KEY);
  const value = (row?.value ?? {}) as Partial<AppSettings>;
  return { ...DEFAULT_SETTINGS, ...value };
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const current = await loadSettings();
  const next = { ...current, ...patch };
  await db.settings.put({ key: SETTINGS_KEY, value: next });
  if (patch.theme) {
    localStorage.setItem(THEME_STORAGE_KEY, patch.theme);
    applyTheme(patch.theme);
  }
  return next;
}

export function applyTheme(theme: AppSettings["theme"]): void {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export { THEME_STORAGE_KEY };

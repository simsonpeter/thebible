import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SETTINGS, type AppSettings } from "@/types/settings";
import { applyTheme, loadSettings, saveSettings } from "@/services/settingsService";

interface SettingsContextValue {
  settings: AppSettings;
  update: (patch: Partial<AppSettings>) => Promise<void>;
  ready: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void loadSettings().then((loaded) => {
      setSettings(loaded);
      applyTheme(loaded.theme);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(settings.theme);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [settings.theme]);

  const update = useCallback(async (patch: Partial<AppSettings>) => {
    const next = await saveSettings(patch);
    setSettings(next);
  }, []);

  const value = useMemo(() => ({ settings, update, ready }), [settings, update, ready]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("useSettings must be used within SettingsProvider");
  return value;
}

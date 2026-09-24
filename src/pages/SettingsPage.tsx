import { useEffect, useState, type ReactNode } from "react";
import { Page } from "@/components/layout/Page";
import { SettingsSection } from "@/components/ui/SettingsSection";
import { Button } from "@/components/ui/Button";
import { FONT_PRESETS, type FontPreset } from "@/types/settings";
import { useSettings } from "@/hooks/useSettings";
import { storageSummary, exportUserData, importUserData, resetUserData, downloadJson } from "@/services/backupService";
import { clearHistory } from "@/services/historyService";
import { useToast } from "@/hooks/useToast";
import { useNavigate } from "react-router-dom";
import { APP_NAME, APP_VERSION } from "@/data/licenses";
import { bsiNoticeFromConfig } from "@/config/bibleLicenses";
import { TranslationLanguagePicker } from "@/components/bible/TranslationSelector";
import { toggleParallelTranslation } from "@/config/translations";
import type { TranslationId } from "@/types/bible";
import { useAuth } from "@/hooks/useAuth";
import { TTS_RATE_OPTIONS } from "@/services/ttsService";

export function SettingsPage() {
  const { settings, update } = useSettings();
  const { push } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [storage, setStorage] = useState({ translations: 0, verses: 0, bookmarks: 0, notes: 0, sermons: 0 });

  useEffect(() => {
    void storageSummary().then(setStorage);
  }, []);

  return (
    <Page title="Settings">
      <SettingsSection title="Account">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-medium">{user?.email || "Not signed in"}</p>
            <p className="mt-1 text-sm text-muted">
              {user ? "Notes, reading, and plans sync across your devices." : "Sign in with your NJC account to sync across devices."}
            </p>
          </div>
          <Button variant={user ? "secondary" : "primary"} onClick={() => navigate("/account")}>
            {user ? "Manage" : "Sign in"}
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Appearance">
        <Row label="Dark mode">
          {(["light", "dark", "system"] as const).map((theme) => (
            <Chip key={theme} active={settings.theme === theme} onClick={() => void update({ theme })}>
              {theme}
            </Chip>
          ))}
        </Row>
        <Row label="Font size">
          <Chip
            active={false}
            onClick={() => {
              const order: FontPreset[] = ["small", "medium", "large", "xl"];
              const index = Math.max(0, order.indexOf(settings.fontPreset) - 1);
              const preset = order[index];
              void update({ fontPreset: preset, ...FONT_PRESETS[preset] });
            }}
          >
            A-
          </Chip>
          <Chip active={true} onClick={() => void update({ fontPreset: "medium", ...FONT_PRESETS.medium })}>
            A
          </Chip>
          <Chip
            active={false}
            onClick={() => {
              const order: FontPreset[] = ["small", "medium", "large", "xl"];
              const index = Math.min(order.length - 1, order.indexOf(settings.fontPreset) + 1);
              const preset = order[index];
              void update({ fontPreset: preset, ...FONT_PRESETS[preset] });
            }}
          >
            A+
          </Chip>
        </Row>
        <Row label="Size">
          {(["small", "medium", "large", "xl"] as FontPreset[]).map((preset) => (
            <Chip
              key={preset}
              active={settings.fontPreset === preset}
              onClick={() => void update({ fontPreset: preset, ...FONT_PRESETS[preset] })}
            >
              {preset === "xl" ? "Extra Large" : preset}
            </Chip>
          ))}
        </Row>
        <Row label="Line spacing">
          {[1.5, 1.7, 1.9].map((value) => (
            <Chip
              key={value}
              active={settings.lineHeight === value}
              onClick={() => void update({ lineHeight: value })}
            >
              {value.toFixed(1)}
            </Chip>
          ))}
        </Row>
        <Row label="High contrast">
          <Toggle value={settings.highContrast} onChange={(value) => void update({ highContrast: value })} />
        </Row>
        <Row label="Tamil font">
          <Chip active={settings.tamilFont === "sans"} onClick={() => void update({ tamilFont: "sans" })}>
            Sans
          </Chip>
          <Chip active={settings.tamilFont === "serif"} onClick={() => void update({ tamilFont: "serif" })}>
            Serif
          </Chip>
        </Row>
        <Row label="English font">
          <Chip active={settings.englishFont === "sans"} onClick={() => void update({ englishFont: "sans" })}>
            Sans
          </Chip>
          <Chip active={settings.englishFont === "serif"} onClick={() => void update({ englishFont: "serif" })}>
            Serif
          </Chip>
        </Row>
      </SettingsSection>

      <SettingsSection title="Bible">
        <div className="grid gap-5 p-4">
          <div>
            <p className="mb-3 text-sm font-medium">Default Bible</p>
            <TranslationLanguagePicker
              selected={settings.defaultTranslation}
              onSelect={(id) => void update({ defaultTranslation: id as TranslationId })}
              order={settings.parallelOrder}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium">Parallel mode</p>
            <div className="flex flex-wrap gap-2">
              <Chip active={settings.readingMode === "single"} onClick={() => void update({ readingMode: "single" })}>
                Single
              </Chip>
              <Chip active={settings.readingMode === "parallel"} onClick={() => void update({ readingMode: "parallel" })}>
                Parallel
              </Chip>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Parallel Bibles</p>
            <TranslationLanguagePicker
              selected={settings.parallelTranslations}
              onSelect={(id) => {
                const next = toggleParallelTranslation(settings.parallelTranslations, id);
                if (next.length === settings.parallelTranslations.length) {
                  push("Keep at least two Bibles in parallel", "info");
                  return;
                }
                void update({ parallelTranslations: next });
              }}
              order={settings.parallelOrder}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium">Parallel order</p>
            <div className="flex flex-wrap gap-2">
              <Chip active={settings.parallelOrder === "tamil-first"} onClick={() => void update({ parallelOrder: "tamil-first" })}>
                Tamil first
              </Chip>
              <Chip active={settings.parallelOrder === "english-first"} onClick={() => void update({ parallelOrder: "english-first" })}>
                English first
              </Chip>
            </div>
          </div>
        </div>
        <Row label="Verse numbers">
          <Chip active={settings.showVerseNumbers} onClick={() => void update({ showVerseNumbers: true })}>
            Show
          </Chip>
          <Chip active={!settings.showVerseNumbers} onClick={() => void update({ showVerseNumbers: false })}>
            Hide
          </Chip>
        </Row>
      </SettingsSection>

      <SettingsSection title="Reading">
        <Row label="Remember position">
          <Toggle value={settings.rememberPosition} onChange={(value) => void update({ rememberPosition: value })} />
        </Row>
        <Row label="Verse-by-verse">
          <Toggle
            value={settings.verseByVerse}
            onChange={(value) => void update({ verseByVerse: value, continuousReading: !value })}
          />
        </Row>
        <Row label="Distraction-free">
          <Toggle value={settings.distractionFree} onChange={(value) => void update({ distractionFree: value })} />
        </Row>
        <Row label="Keep screen awake">
          <Toggle value={settings.wakeLock} onChange={(value) => void update({ wakeLock: value })} />
        </Row>
        <Row label="Listen speed">
          {TTS_RATE_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              active={settings.ttsRate === option.value}
              onClick={() => void update({ ttsRate: option.value })}
            >
              {option.label}
            </Chip>
          ))}
        </Row>
        <div className="p-4">
          <Button variant="secondary" onClick={() => void clearHistory().then(() => push("History cleared", "success"))}>
            Clear reading history
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Language">
        <Row label="App language">
          <Chip active={settings.uiLanguage === "en"} onClick={() => void update({ uiLanguage: "en" })}>
            English
          </Chip>
          <Chip active={settings.uiLanguage === "ta"} onClick={() => void update({ uiLanguage: "ta" })}>
            தமிழ்
          </Chip>
        </Row>
      </SettingsSection>

      <SettingsSection title="Bible Data">
        <div className="p-4 text-sm text-muted">
          Translations {storage.translations} • Verses {storage.verses.toLocaleString()}
        </div>
        <div className="flex flex-wrap gap-2 p-4">
          <Button onClick={() => navigate("/import")}>Import Bible</Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Backup">
        <div className="p-4 text-sm text-muted">
          Bookmarks {storage.bookmarks} • Notes {storage.notes} • Sermons {storage.sermons}. Bible text is not exported.
        </div>
        <div className="flex flex-wrap gap-2 p-4">
          <Button
            variant="secondary"
            onClick={() => {
              void exportUserData().then((data) => downloadJson(`njc-bible-backup-${Date.now()}.json`, data));
            }}
          >
            Export My Data
          </Button>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-paper-2 px-4 text-sm font-semibold dark:bg-white/10">
            Import data
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void file.text().then(async (text) => {
                  try {
                    await importUserData(JSON.parse(text));
                    push("Backup restored", "success");
                  } catch (error) {
                    push(error instanceof Error ? error.message : "Invalid backup file.", "error");
                  }
                });
              }}
            />
          </label>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm("Reset local bookmarks, notes, sermons, highlights, plans, and settings? Bible text stays.")) {
                void resetUserData().then(() => push("Local user data reset", "success"));
              }
            }}
          >
            Clear local data
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Privacy">
        <div className="p-4 text-sm">
          <p>Reading stays on this device until you sign in. Signed-in data syncs with your NJC account.</p>
          <Button variant="ghost" className="mt-3" onClick={() => navigate("/privacy")}>
            Privacy Policy
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="About">
        <div className="p-4 text-sm">
          <p className="font-semibold">{APP_NAME}</p>
          <p>Version {APP_VERSION}</p>
          <p className="mt-2 whitespace-pre-line">{bsiNoticeFromConfig()}</p>
          <Button variant="ghost" className="mt-3" onClick={() => navigate("/about")}>
            Bible Information
          </Button>
        </div>
      </SettingsSection>
    </Page>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-full px-3 text-sm capitalize ${active ? "bg-navy text-white dark:bg-gold dark:text-navy-deep" : "bg-paper-2 dark:bg-white/10"}`}
    >
      {children}
    </button>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={value ? "On" : "Off"}
      className={`h-8 w-14 rounded-full ${value ? "bg-navy dark:bg-gold" : "bg-navy/20"}`}
      onClick={() => onChange(!value)}
    >
      <span className={`block h-6 w-6 translate-y-1 rounded-full bg-white transition ${value ? "translate-x-7" : "translate-x-1"}`} />
    </button>
  );
}

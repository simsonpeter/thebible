import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/pages/HomePage";
import { BiblePage } from "@/pages/BiblePage";
import { SearchPage } from "@/pages/SearchPage";
import { SavedPage } from "@/pages/SavedPage";
import { BookmarksPage } from "@/pages/BookmarksPage";
import { HighlightsPage } from "@/pages/HighlightsPage";
import { NotesPage } from "@/pages/NotesPage";
import { SermonsPage } from "@/pages/SermonsPage";
import { SermonEditorPage } from "@/pages/SermonEditorPage";
import { ReadingPlansPage } from "@/pages/ReadingPlansPage";
import { PlanDetailPage } from "@/pages/PlanDetailPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AboutPage } from "@/pages/AboutPage";
import { MorePage } from "@/pages/MorePage";
import { ProgressPage } from "@/pages/ProgressPage";
import { VerseImagePage } from "@/pages/VerseImagePage";
import { ImportPage } from "@/pages/ImportPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { SettingsProvider } from "@/hooks/useSettings";
import { ToastProvider } from "@/hooks/useToast";
import { useBibleInit } from "@/hooks/useBibleInit";

export function App() {
  const { ready, error, progress } = useBibleInit();

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">NJC Bible App</h1>
          <p className="mt-4">Bible data is not installed yet.</p>
          <p className="mt-2 text-sm text-muted">{error}</p>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-navy px-6 text-center text-white">
        <div>
          <p className="text-sm tracking-[0.3em] text-gold uppercase">NJC Bible App</p>
          <h1 className="mt-3 text-3xl font-semibold">Preparing your offline Bible</h1>
          <p className="mt-4 text-gold-soft">{progress.stage}</p>
          <div className="mx-auto mt-6 h-2 w-56 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gold" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <SettingsProvider>
      <ToastProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/bible" element={<BiblePage />} />
              <Route path="/bible/:book" element={<BiblePage />} />
              <Route path="/bible/:book/:chapter" element={<BiblePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/highlights" element={<HighlightsPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/sermons" element={<SermonsPage />} />
              <Route path="/sermons/:id" element={<SermonEditorPage />} />
              <Route path="/reading-plans" element={<ReadingPlansPage />} />
              <Route path="/reading-plans/:planId" element={<PlanDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/more" element={<MorePage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/verse-image" element={<VerseImagePage />} />
              <Route path="/import" element={<ImportPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </SettingsProvider>
  );
}

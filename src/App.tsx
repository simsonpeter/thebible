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
import { AccountPage } from "@/pages/AccountPage";
import { DictionaryPage } from "@/pages/DictionaryPage";
import { CommentaryPage } from "@/pages/CommentaryPage";
import { SettingsProvider } from "@/hooks/useSettings";
import { ToastProvider } from "@/hooks/useToast";
import { AuthProvider } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/SplashScreen";
import { useBibleInit } from "@/hooks/useBibleInit";

export function App() {
  const { ready, error, progress } = useBibleInit();

  if (error) {
    return <SplashScreen error={error} />;
  }

  if (!ready) {
    return <SplashScreen stage={progress.stage} percent={progress.percent} />;
  }

  return (
    <SettingsProvider>
      <ToastProvider>
        <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/bible" element={<BiblePage />} />
              <Route path="/bible/:book" element={<BiblePage />} />
              <Route path="/bible/:book/:chapter" element={<BiblePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/dictionary" element={<DictionaryPage />} />
              <Route path="/commentary" element={<CommentaryPage />} />
              <Route path="/commentary/:book" element={<CommentaryPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/highlights" element={<HighlightsPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/sermons" element={<SermonsPage />} />
              <Route path="/sermons/:id" element={<SermonEditorPage />} />
              <Route path="/reading-plans" element={<ReadingPlansPage />} />
              <Route path="/reading-plans/:planId" element={<PlanDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/account" element={<AccountPage />} />
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
        </AuthProvider>
      </ToastProvider>
    </SettingsProvider>
  );
}

import { Outlet } from "react-router-dom";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toast } from "@/components/ui/Toast";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/utils/misc";

export function AppShell() {
  const { settings } = useSettings();
  return (
    <div
      className={cn(
        "min-h-screen bg-paper text-ink dark:bg-[#090c10] dark:text-paper",
        settings.highContrast && "high-contrast",
      )}
      style={{
        ["--tamil-size" as string]: `${settings.tamilFontSize}px`,
        ["--english-size" as string]: `${settings.englishFontSize}px`,
        ["--verse-leading" as string]: String(settings.lineHeight),
        ["--verse-gap" as string]: `${settings.verseSpacing}px`,
      }}
    >
      <div className="mx-auto flex max-w-6xl">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
      <BottomNavigation />
      <Toast />
    </div>
  );
}

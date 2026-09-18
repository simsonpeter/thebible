import type { ReactNode } from "react";
import { OfflineBadge } from "@/components/ui/OfflineBadge";

export function TopBar({
  title,
  subtitle,
  left,
  right,
  showStatus = false,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  showStatus?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-navy/8 bg-paper/90 px-4 py-3 backdrop-blur safe-top dark:border-white/10 dark:bg-[#0c1016]/90">
      <div className="flex min-h-12 items-center gap-3">
        {left}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="truncate text-xs text-muted dark:text-white/55">{subtitle}</p> : null}
        </div>
        {showStatus ? <OfflineBadge compact /> : null}
        {right}
      </div>
    </header>
  );
}

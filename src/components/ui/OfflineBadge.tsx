import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { cn } from "@/utils/misc";

export function OfflineBadge({ compact = false }: { compact?: boolean }) {
  const online = useOnlineStatus();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        online
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
          : "bg-gold-soft/70 text-navy-deep dark:bg-gold/20 dark:text-gold-soft",
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", online ? "bg-emerald-500" : "bg-gold")} />
      {compact ? (online ? "Online" : "OFFLINE") : online ? "● Online" : "● OFFLINE"}
    </span>
  );
}

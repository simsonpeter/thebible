import { useEffect, type ReactNode } from "react";
import { cn } from "@/utils/misc";

export function Modal({
  open,
  title,
  children,
  onClose,
  wide,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-navy-deep/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative max-h-[88vh] w-full overflow-hidden rounded-3xl bg-paper shadow-2xl dark:bg-[#12171e]",
          wide ? "max-w-3xl" : "max-w-lg",
        )}
      >
        <div className="flex items-center justify-between border-b border-navy/10 px-5 py-4 dark:border-white/10">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-full text-xl"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(88vh-4.5rem)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

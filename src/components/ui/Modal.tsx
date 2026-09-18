import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-navy-deep/60"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex h-[100dvh] w-full flex-col bg-paper shadow-2xl dark:bg-[#12171e] sm:h-auto sm:max-h-[min(88dvh,52rem)] sm:rounded-3xl",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-navy/10 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4 dark:border-white/10">
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
        <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

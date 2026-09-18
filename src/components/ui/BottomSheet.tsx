import { useEffect, type ReactNode } from "react";

export function BottomSheet({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-navy-deep/45"
        aria-label="Close sheet"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-xl rounded-t-3xl bg-paper p-5 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl dark:bg-[#141a22]"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-navy/20 dark:bg-white/20" />
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

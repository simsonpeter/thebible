import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/misc";

export function Toast() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[70] flex w-[min(90vw,22rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={cn(
            "pointer-events-auto min-h-11 rounded-2xl px-4 py-3 text-left text-sm text-white shadow-lg",
            toast.kind === "success" && "bg-navy",
            toast.kind === "error" && "bg-red-700",
            toast.kind === "info" && "bg-navy-soft",
          )}
          onClick={() => dismiss(toast.id)}
        >
          {toast.text}
        </button>
      ))}
    </div>
  );
}

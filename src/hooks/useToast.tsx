import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ToastKind = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  push: (text: string, kind?: ToastKind) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (text: string, kind: ToastKind = "info") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current.slice(-3), { id, kind, text }]);
      window.setTimeout(() => dismiss(id), 2800);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within ToastProvider");
  return value;
}

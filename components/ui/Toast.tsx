"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

type ToastTone = "success" | "error";
type ToastItem = { id: number; message: string; tone: ToastTone };
type ShowToast = (message: string, tone?: ToastTone) => void;

const ToastContext = createContext<ShowToast>(() => {});

const TOAST_MS = 3500;

// Short confirmation messages (C2, C20), announced to screen readers through a live region.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const show = useCallback<ShowToast>(
    (message, tone = "success") => {
      const id = nextId.current++;
      setToasts((all) => [...all.slice(-2), { id, message, tone }]);
      setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-[toast-in_200ms_ease-out] items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-fg shadow-pop"
          >
            {t.tone === "success" ? (
              <CircleCheck size={18} className="shrink-0 text-success" aria-hidden="true" />
            ) : (
              <CircleAlert size={18} className="shrink-0 text-danger" aria-hidden="true" />
            )}
            <span className="flex-1">{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="rounded p-0.5 text-fg-muted hover:text-fg">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  return useContext(ToastContext);
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useDismiss } from "@/hooks/useDismiss";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** id used to associate the dialog with its title via aria-labelledby. */
  labelledBy: string;
  children: ReactNode;
  /** Overrides the panel's max width (default "max-w-md"), e.g. for ImageViewer's larger panel. */
  widthClassName?: string;
};

// Generic modal dialog: dimmed overlay, centred rounded panel with a header bar and an X close
// button. Callers supply the content.
export function Modal({ open, onClose, title, labelledBy, children, widthClassName }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useDismiss(panelRef, open, onClose);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    return () => {
      previouslyFocused.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`w-full ${widthClassName ?? "max-w-md"} rounded-xl bg-surface shadow-pop outline-none`}
      >
        <div className="flex items-center justify-between rounded-t-xl border-b border-border bg-surface px-4 py-3">
          <h2 id={labelledBy} className="text-base font-bold text-fg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-fg hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M1 1 L15 15 M15 1 L1 15"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

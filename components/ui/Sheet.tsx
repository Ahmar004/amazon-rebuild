"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useDismiss } from "@/hooks/useDismiss";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Which edge the panel slides in from. */
  side?: "left" | "right" | "bottom";
  children: ReactNode;
  /** Optional content pinned to the bottom of the panel, e.g. action buttons. */
  footer?: ReactNode;
};

const PANEL: Record<NonNullable<SheetProps["side"]>, string> = {
  left: "inset-y-0 left-0 h-full w-[min(360px,88vw)] rounded-r-xl",
  right: "inset-y-0 right-0 h-full w-[min(420px,92vw)] rounded-l-xl",
  bottom: "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-2xl",
};

const ENTER: Record<NonNullable<SheetProps["side"]>, string> = {
  left: "animate-[sheet-left_200ms_ease-out]",
  right: "animate-[sheet-right_200ms_ease-out]",
  bottom: "animate-[sheet-bottom_200ms_ease-out]",
};

// Slide-in panel over a dimmed page (C2): the All menu, the cart drawer and mobile filters.
// Esc and a click on the backdrop close it; focus moves into the panel and back on close.
export function Sheet({ open, onClose, title, side = "left", children, footer }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(panelRef, open, onClose);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-overlay animate-[fade-in_150ms_ease-out]">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`absolute flex flex-col bg-surface text-fg shadow-pop outline-none ${PANEL[side]} ${ENTER[side]}`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 hover:bg-surface-muted">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-border p-4">{footer}</div>}
      </div>
    </div>
  );
}

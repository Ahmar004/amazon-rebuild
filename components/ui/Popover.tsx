"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { useDismiss } from "@/hooks/useDismiss";

type PopoverProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Classes on the wrapper that anchors/positions the panel (e.g. "absolute top-full left-0"). */
  anchorClassName?: string;
  /** Extra classes on the panel itself (e.g. width). */
  className?: string;
  /**
   * The button that opens/toggles this popover. Passed through to useDismiss so a pointerdown on
   * the trigger isn't treated as "outside" - otherwise a second click to close fires close() then
   * immediately toggle()'s it back open (see useDismiss.ts).
   */
  triggerRef?: RefObject<HTMLElement | null>;
  /** Which edge of the panel the caret sits near: "left" (default) or "right" for right-aligned panels. */
  align?: "left" | "right";
};

// Generic positioned popover: a rounded card with a 1px border, soft shadow and an upward caret.
// It scales in from its anchor corner. Callers supply the content.
export function Popover({ open, onClose, children, anchorClassName, className, triggerRef, align = "left" }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useDismiss(ref, open, onClose, triggerRef);

  if (!open) return null;

  return (
    <div ref={ref} className={`absolute z-50 ${anchorClassName ?? ""}`}>
      <div className={`pop-in relative mt-2 ${align === "right" ? "origin-top-right" : "origin-top-left"}`}>
        <div
          className={`absolute -top-2 ${align === "right" ? "right-4" : "left-4"} h-4 w-4 rotate-45 border-l border-t border-border bg-surface`}
          aria-hidden="true"
        />
        <div
          className={`relative rounded-xl border border-border bg-surface shadow-pop ${className ?? ""}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

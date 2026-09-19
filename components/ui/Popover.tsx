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
};

// Generic positioned popover: Amazon's white card with a 1px border, soft shadow, 8px radius
// and an upward caret. No Amazon-specific content lives here - callers supply children.
export function Popover({ open, onClose, children, anchorClassName, className, triggerRef }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useDismiss(ref, open, onClose, triggerRef);

  if (!open) return null;

  return (
    <div ref={ref} className={`absolute z-50 ${anchorClassName ?? ""}`}>
      <div className="relative mt-2">
        <div
          className="absolute -top-2 left-4 h-4 w-4 rotate-45 border-l border-t border-border bg-white"
          aria-hidden="true"
        />
        <div
          className={`relative rounded-lg border border-border bg-white ${className ?? ""}`}
          style={{ boxShadow: "0 2px 4px rgba(0,0,0,.13)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

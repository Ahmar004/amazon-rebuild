"use client";

import { useEffect, type RefObject } from "react";

// Shared dismiss behaviour for popovers/modals: Escape key, or a pointerdown outside the
// referenced element, calls onDismiss. Used by components/ui/Popover.tsx and Modal.tsx.
//
// `triggerRef` is optional and covers click-to-toggle triggers (AccountFlyout, LanguagePopover):
// without it, a pointerdown on the trigger button counts as "outside" the panel and closes the
// popover before the button's own click handler can toggle it back open, so a second click can
// never close it. Treating the trigger as "inside" for dismissal purposes lets the trigger's own
// onClick (toggle) be the single source of truth for open/close on click.
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void,
  triggerRef?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (ref.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return;
      onDismiss();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [ref, open, onDismiss, triggerRef]);
}

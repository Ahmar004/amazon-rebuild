"use client";

import { useEffect, type RefObject } from "react";

// Shared dismiss behaviour for popovers/modals: Escape key, or a pointerdown outside the
// referenced element, calls onDismiss. Used by components/ui/Popover.tsx and Modal.tsx.
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void,
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
      if (ref.current && target && !ref.current.contains(target)) {
        onDismiss();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [ref, open, onDismiss]);
}

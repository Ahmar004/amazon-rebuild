"use client";

import { useCallback, useRef, useState } from "react";

// Shared open/close state for the header's hover-triggered menus (AccountFlyout,
// LanguagePopover): opens after `openDelayMs` of hover intent, closes immediately on
// mouse leave, and can be toggled or closed directly (click, Esc via useDismiss).
export function useHoverPopover(openDelayMs = 0) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onMouseEnter = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(true), openDelayMs);
  }, [clearTimer, openDelayMs]);

  const onMouseLeave = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer]);

  const toggle = useCallback(() => {
    clearTimer();
    setOpen((prev) => !prev);
  }, [clearTimer]);

  const close = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer]);

  return { open, onMouseEnter, onMouseLeave, toggle, close };
}

"use client";

import { useCallback, useSyncExternalStore } from "react";
import { applyTheme, readTheme, type Theme } from "@/lib/theme";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Current theme plus a toggle. The server snapshot is "light" (the default); the real value is
// read from <html data-theme> after hydration, which THEME_SCRIPT set before paint.
export function useTheme(): { theme: Theme; toggle: () => void } {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);
  const toggle = useCallback(() => {
    applyTheme(readTheme() === "dark" ? "light" : "dark");
    listeners.forEach((l) => l());
  }, []);
  return { theme, toggle };
}

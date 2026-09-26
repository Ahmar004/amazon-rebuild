// Light/dark theme (frontend-rebuild.md points 6 and 7). Light is the default on every first
// visit; a viewer's choice is remembered in localStorage and applied by THEME_SCRIPT before the
// first paint, so the page never flashes the wrong theme.

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = "shopeedo-theme";

export const THEME_SCRIPT = `try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  if (theme === "dark") document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this page view.
  }
}

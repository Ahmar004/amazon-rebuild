import { useEffect, useState } from "react";

const DEBOUNCE_MS = 150;
const MIN_LENGTH = 2;

// A stable reference for the "too short to search" case. Returning a fresh `[]` literal each
// render instead would make every consuming `suggestions !== previous` check (SearchBar.tsx)
// true forever, since two different empty arrays are never ===, causing an infinite re-render
// loop on any page whose search box starts empty (Slice 5 hit this on /cart).
const NO_SUGGESTIONS: string[] = [];

// Debounces GET /api/suggest?q= for the header search typeahead (docs/design.md 6.1, 6.3) and
// cancels a stale in-flight request with an AbortController when the query changes again.
export function useTypeahead(query: string): { suggestions: string[] } {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const trimmed = query.trim();
  const tooShort = trimmed.length < MIN_LENGTH;

  useEffect(() => {
    // Below the minimum length there is nothing to fetch; the hook returns [] for that case
    // below without touching state here (state changes stay inside async callbacks, never
    // synchronously in the effect body).
    if (tooShort) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: { suggestions: string[] }) => setSuggestions(data.suggestions))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setSuggestions([]);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, tooShort]);

  return { suggestions: tooShort ? NO_SUGGESTIONS : suggestions };
}

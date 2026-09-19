import { useEffect, useState } from "react";

const DEBOUNCE_MS = 150;
const MIN_LENGTH = 2;

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

  return { suggestions: tooShort ? [] : suggestions };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWishlistAsins, setWishlisted } from "@/actions/wishlist";

export type WishlistToggleResult = { ok: boolean; wishlisted: boolean; error?: string };

export type WishlistState = {
  has: (asin: string) => boolean;
  toggle: (asin: string) => Promise<WishlistToggleResult>;
  count: number;
  ready: boolean;
};

const GENERIC_ERROR = "Could not update your wishlist. Please try again.";

// The shopper's wishlisted ASINs, loaded once per page load, with optimistic toggles that roll back
// if the server call fails (frontend-rebuild.md C20). Pages stay cacheable because the hearts
// learn their state here, on the client, instead of from the server render.
export function useWishlistState(): WishlistState {
  const [asins, setAsins] = useState<Set<string>>(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchWishlistAsins()
      .then((list) => {
        if (!cancelled) setAsins(new Set(list));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const has = useCallback((asin: string) => asins.has(asin), [asins]);

  const toggle = useCallback(
    async (asin: string): Promise<WishlistToggleResult> => {
      const wishlisted = !asins.has(asin);
      const apply = (on: boolean) =>
        setAsins((current) => {
          const next = new Set(current);
          if (on) next.add(asin);
          else next.delete(asin);
          return next;
        });
      apply(wishlisted);
      try {
        const result = await setWishlisted(asin, wishlisted);
        if (result.ok) return { ok: true, wishlisted };
        apply(!wishlisted);
        return { ok: false, wishlisted: !wishlisted, error: result.error };
      } catch {
        apply(!wishlisted);
        return { ok: false, wishlisted: !wishlisted, error: GENERIC_ERROR };
      }
    },
    [asins],
  );

  return { has, toggle, count: asins.size, ready };
}

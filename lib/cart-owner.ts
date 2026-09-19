// Resolves which cart a request belongs to. For now every visitor is a guest (Slice 6 adds the
// signed-in branch here, ahead of the guest one, and calls lib/data/cart.ts's mergeGuestCart at
// sign-in). Kept as one function per CLAUDE.md: "Derive every signed-in ... UI decision from one
// session object", so later slices only touch this file, not every caller.
import { ensureGuestToken, getGuestToken } from "@/lib/auth/guest";
import type { CartOwner } from "@/lib/data/cart";

// Read-only: resolves the current owner without creating a guest cookie. Returns null when the
// visitor has no cart yet (no cart_token cookie set), which callers treat as an empty cart.
export async function getCartOwner(): Promise<CartOwner | null> {
  const guestToken = await getGuestToken();
  return guestToken ? { guestToken } : null;
}

// Mutates cookies() when no cart_token exists yet, so only callable from a Server Action or
// Route Handler (writes require an owner to exist, e.g. addToCart).
export async function getCartOwnerOrCreate(): Promise<CartOwner> {
  const guestToken = await ensureGuestToken();
  return { guestToken };
}

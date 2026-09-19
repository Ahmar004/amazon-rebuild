// Resolves which cart a request belongs to: a signed-in user's cart takes priority, falling back
// to the guest cart_token cookie (Slice 6 adds the signed-in branch, ahead of the guest one; the
// guest cart is folded into the user's cart at sign-in by actions/auth.ts's mergeGuestCart call).
// Kept as one function per CLAUDE.md: "Derive every signed-in ... UI decision from one session
// object", so later slices only touch this file, not every caller.
import { getCurrentUser } from "@/lib/auth/current-user";
import { ensureGuestToken, getGuestToken } from "@/lib/auth/guest";
import type { CartOwner } from "@/lib/data/cart";

// Read-only: resolves the current owner without creating a guest cookie. Returns null when the
// visitor is signed out and has no cart yet (no cart_token cookie set), which callers treat as
// an empty cart.
export async function getCartOwner(): Promise<CartOwner | null> {
  const user = await getCurrentUser();
  if (user) return { userId: user.id };

  const guestToken = await getGuestToken();
  return guestToken ? { guestToken } : null;
}

// Mutates cookies() when signed out and no cart_token exists yet, so only callable from a Server
// Action or Route Handler (writes require an owner to exist, e.g. addToCart).
export async function getCartOwnerOrCreate(): Promise<CartOwner> {
  const user = await getCurrentUser();
  if (user) return { userId: user.id };

  const guestToken = await ensureGuestToken();
  return { guestToken };
}

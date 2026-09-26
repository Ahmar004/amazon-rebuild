"use server";

// Wishlist Server Actions (frontend-rebuild.md C14, C20). The user always comes from the session,
// never from the client. A failure is reported back so the heart can roll its optimistic update.
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { addToWishlist, getWishlistAsins, removeFromWishlist } from "@/lib/data/wishlist";
import { asinSchema } from "@/lib/validation/cart";
import { ROUTES } from "@/lib/constants/links";

type WishlistResult = { ok: true; count: number } | { ok: false; error: string };

const GENERIC_ERROR = "Could not update your wishlist. Please try again.";

export async function fetchWishlistAsins(): Promise<string[]> {
  const user = await getCurrentUser();
  return user ? getWishlistAsins(user.id) : [];
}

export async function setWishlisted(asin: string, wishlisted: boolean): Promise<WishlistResult> {
  const parsed = asinSchema.safeParse(asin);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to use your wishlist." };

  try {
    if (wishlisted) await addToWishlist(user.id, parsed.data);
    else await removeFromWishlist(user.id, parsed.data);
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath(ROUTES.wishlist);
  const asins = await getWishlistAsins(user.id);
  return { ok: true, count: asins.length };
}

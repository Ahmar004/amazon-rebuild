"use server";

// Server Actions behind every cart mutation (docs/superpowers/plans/2026-09-19-slice-5-cart.md).
// Each validates its input with Zod, resolves the owner from cookies (never trusts a client-sent
// owner), and revalidates the layout so the header's CartCount reflects the write in the same
// round trip (see node_modules/next/dist/docs/.../server-actions.md: "Calls ... revalidatePath").
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCartOwnerOrCreate } from "@/lib/cart-owner";
import * as cartData from "@/lib/data/cart";
import {
  addToCartInputSchema,
  asinSchema,
  updateQuantityInputSchema,
  type CartRedirectTarget,
} from "@/lib/validation/cart";

const GENERIC_ERROR = "Something went wrong. Please try again.";

type ActionResult = { ok: true } | { ok: false; error: string };
type AddToCartResult = { ok: true; count: number } | { ok: false; error: string };

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : GENERIC_ERROR;
}

// "smart-wagon" redirects to the added-to-cart interstitial; "none" adds in place (search rows,
// carousels) and returns the new header count so the caller can update without navigating.
export async function addToCart(input: {
  asin: string;
  quantity: number;
  redirectTo: CartRedirectTarget;
}): Promise<AddToCartResult> {
  const parsed = addToCartInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };

  const owner = await getCartOwnerOrCreate();

  try {
    await cartData.addItem(owner, parsed.data.asin, parsed.data.quantity);
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }

  revalidatePath("/", "layout");

  if (parsed.data.redirectTo === "smart-wagon") {
    redirect(`/cart/smart-wagon?asin=${encodeURIComponent(parsed.data.asin)}&qty=${parsed.data.quantity}`);
  }

  const count = await cartData.cartCount(owner);
  return { ok: true, count };
}

export async function updateQuantity(asin: string, quantity: number): Promise<ActionResult> {
  const parsed = updateQuantityInputSchema.safeParse({ asin, quantity });
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };

  const owner = await getCartOwnerOrCreate();
  await cartData.setQuantity(owner, parsed.data.asin, parsed.data.quantity);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteItem(asin: string): Promise<ActionResult> {
  const parsed = asinSchema.safeParse(asin);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };

  const owner = await getCartOwnerOrCreate();
  await cartData.removeItem(owner, parsed.data);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveForLater(asin: string): Promise<ActionResult> {
  const parsed = asinSchema.safeParse(asin);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };

  const owner = await getCartOwnerOrCreate();
  await cartData.setSaved(owner, parsed.data, true);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function moveToCart(asin: string): Promise<ActionResult> {
  const parsed = asinSchema.safeParse(asin);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };

  const owner = await getCartOwnerOrCreate();
  await cartData.setSaved(owner, parsed.data, false);
  revalidatePath("/", "layout");
  return { ok: true };
}

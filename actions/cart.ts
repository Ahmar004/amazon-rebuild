"use server";

// Server Actions behind every cart mutation. Each validates its input with Zod, resolves the owner
// from cookies (never trusts a client-sent owner), and returns the fresh cart, so the cart drawer
// and header count update from the server's numbers (frontend-rebuild.md C8, C20). revalidatePath
// also refreshes a server-rendered /cart page when the drawer changes the same cart.
import { revalidatePath } from "next/cache";
import { getCartOwner, getCartOwnerOrCreate } from "@/lib/cart-owner";
import * as cartData from "@/lib/data/cart";
import { freeShippingProgress } from "@/lib/pricing/shipping";
import { addToCartInputSchema, asinSchema, updateQuantityInputSchema } from "@/lib/validation/cart";
import type { CartSnapshot } from "@/lib/cart/snapshot";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export type CartActionResult = { ok: true; cart: CartSnapshot } | { ok: false; error: string };

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : GENERIC_ERROR;
}

function toSnapshot(view: cartData.CartView): CartSnapshot {
  return {
    lines: view.lines,
    subtotalCents: view.subtotalCents,
    itemCount: view.itemCount,
    freeShipping: freeShippingProgress(view.subtotalCents),
  };
}

// The drawer's first load. A visitor with no cart cookie has never added anything.
export async function fetchCart(): Promise<CartSnapshot> {
  const owner = await getCartOwner();
  return toSnapshot(owner ? await cartData.getCart(owner) : { lines: [], saved: [], subtotalCents: 0, itemCount: 0 });
}

// Runs one validated write for the current owner, then returns the cart as it now stands.
async function mutate(write: (owner: cartData.CartOwner) => Promise<void>): Promise<CartActionResult> {
  const owner = await getCartOwnerOrCreate();
  try {
    await write(owner);
    const cart = toSnapshot(await cartData.getCart(owner));
    revalidatePath("/", "layout");
    return { ok: true, cart };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function addToCart(input: { asin: string; quantity: number }): Promise<CartActionResult> {
  const parsed = addToCartInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };
  return mutate((owner) => cartData.addItem(owner, parsed.data.asin, parsed.data.quantity));
}

export async function updateQuantity(asin: string, quantity: number): Promise<CartActionResult> {
  const parsed = updateQuantityInputSchema.safeParse({ asin, quantity });
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };
  return mutate((owner) => cartData.setQuantity(owner, parsed.data.asin, parsed.data.quantity));
}

export async function deleteItem(asin: string): Promise<CartActionResult> {
  const parsed = asinSchema.safeParse(asin);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };
  return mutate((owner) => cartData.removeItem(owner, parsed.data));
}

export async function saveForLater(asin: string): Promise<CartActionResult> {
  const parsed = asinSchema.safeParse(asin);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };
  return mutate((owner) => cartData.setSaved(owner, parsed.data, true));
}

export async function moveToCart(asin: string): Promise<CartActionResult> {
  const parsed = asinSchema.safeParse(asin);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };
  return mutate((owner) => cartData.setSaved(owner, parsed.data, false));
}

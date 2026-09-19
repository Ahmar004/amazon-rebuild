// Cart data layer (docs/superpowers/plans/2026-09-19-slice-5-cart.md). Every function takes a
// CartOwner and filters by it in SQL, so one owner can never read or write another owner's cart.
// Money (lineTotalCents, subtotalCents) is computed here, server-side, never by the client.
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { carts, cartItems, departments, products } from "@/lib/db/schema";
import { mapProductSummaryRow, type ProductSummary, type ProductSummaryRow } from "@/lib/data/products";

export type CartOwner = { userId: string } | { guestToken: string };

export type CartLine = ProductSummary & {
  quantity: number;
  lineTotalCents: number;
  maxQuantity: number;
};

export type CartView = {
  lines: CartLine[];
  saved: CartLine[];
  subtotalCents: number;
  itemCount: number;
};

const EMPTY_CART: CartView = { lines: [], saved: [], subtotalCents: 0, itemCount: 0 };

// The most a single cart line can ever hold, regardless of stock (plan: "caps the quantity at
// min(stock, 30)"). Shared with lib/validation/cart.ts and components/product/BuyBox.tsx so the
// literal 30 lives in one place.
export const MAX_CART_QUANTITY = 30;

// Pure: how many units a line may hold given the product's live stock. Used both for a fresh line
// and to bound whatever a caller (form, stepper) asks for.
export function capQuantity(requested: number, stock: number): number {
  const cap = Math.max(0, Math.min(stock, MAX_CART_QUANTITY));
  return Math.max(0, Math.min(requested, cap));
}

// Pure: the new quantity when addItem adds `addQty` to an `existing` line, capped the same way.
export function mergeQuantities(existing: number, addQty: number, stock: number): number {
  return capQuantity(existing + addQty, stock);
}

export const CART_ERROR_UNKNOWN_PRODUCT = "This item is no longer available.";
export const CART_ERROR_OUT_OF_STOCK = "This item is currently out of stock.";

function ownerFilter(owner: CartOwner) {
  return "userId" in owner ? eq(carts.userId, owner.userId) : eq(carts.guestToken, owner.guestToken);
}

async function findCartId(owner: CartOwner): Promise<string | null> {
  const [row] = await db.select({ id: carts.id }).from(carts).where(ownerFilter(owner)).limit(1);
  return row?.id ?? null;
}

async function getOrCreateCartId(owner: CartOwner): Promise<string> {
  const existing = await findCartId(owner);
  if (existing) return existing;

  const [row] = await db
    .insert(carts)
    .values("userId" in owner ? { userId: owner.userId } : { guestToken: owner.guestToken })
    .returning({ id: carts.id });
  return row.id;
}

async function productStock(asin: string): Promise<number | null> {
  const [row] = await db.select({ stock: products.stock }).from(products).where(eq(products.asin, asin)).limit(1);
  return row?.stock ?? null;
}

type CartItemRow = ProductSummaryRow & { quantity: number; savedForLater: boolean };

function toCartLine(row: CartItemRow): CartLine {
  const summary = mapProductSummaryRow(row);
  return {
    ...summary,
    quantity: row.quantity,
    lineTotalCents: summary.priceCents * row.quantity,
    maxQuantity: Math.max(0, Math.min(summary.stock, MAX_CART_QUANTITY)),
  };
}

// The visitor's cart: current lines plus saved-for-later lines. Reads cookies indirectly (the
// caller resolves `owner` from getCartOwner()), so this is never called from inside 'use cache'.
export async function getCart(owner: CartOwner): Promise<CartView> {
  const cartId = await findCartId(owner);
  if (!cartId) return EMPTY_CART;

  const rows = await db
    .select({
      asin: products.asin,
      title: products.title,
      brand: products.brand,
      departmentSlug: departments.slug,
      images: products.images,
      priceCents: products.priceCents,
      listPriceCents: products.listPriceCents,
      ratingAvg: products.ratingAvg,
      ratingCount: products.ratingCount,
      stock: products.stock,
      isBestSeller: products.isBestSeller,
      quantity: cartItems.quantity,
      savedForLater: cartItems.savedForLater,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.asin, cartItems.asin))
    .innerJoin(departments, eq(departments.id, products.departmentId))
    .where(eq(cartItems.cartId, cartId));

  const lines = rows.filter((r) => !r.savedForLater).map(toCartLine);
  const saved = rows.filter((r) => r.savedForLater).map(toCartLine);
  const subtotalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return { lines, saved, subtotalCents, itemCount };
}

// Adds `qty` to the owner's cart: a fresh line is capped at min(stock, 30); an existing line
// (saved or not) has `qty` merged in with the same cap and is moved back into the cart. Throws
// when the asin is unknown or has no stock, so actions/cart.ts can surface a clear error.
export async function addItem(owner: CartOwner, asin: string, qty: number): Promise<void> {
  const stock = await productStock(asin);
  if (stock === null) throw new Error(CART_ERROR_UNKNOWN_PRODUCT);
  if (stock <= 0) throw new Error(CART_ERROR_OUT_OF_STOCK);

  const cartId = await getOrCreateCartId(owner);
  const [existing] = await db
    .select({ quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.asin, asin)))
    .limit(1);

  const quantity = existing ? mergeQuantities(existing.quantity, qty, stock) : capQuantity(qty, stock);

  await db
    .insert(cartItems)
    .values({ cartId, asin, quantity, savedForLater: false })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.asin],
      set: { quantity, savedForLater: false },
    });
}

// Sets a line's quantity directly (the cart page's stepper); 0 deletes the line. A no-op when the
// owner has no cart or no line for this asin - there's nothing to change.
export async function setQuantity(owner: CartOwner, asin: string, qty: number): Promise<void> {
  const cartId = await findCartId(owner);
  if (!cartId) return;

  if (qty <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.cartId, cartId), eq(cartItems.asin, asin)));
    return;
  }

  const stock = await productStock(asin);
  if (stock === null) return;

  await db
    .update(cartItems)
    .set({ quantity: capQuantity(qty, stock) })
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.asin, asin)));
}

export async function removeItem(owner: CartOwner, asin: string): Promise<void> {
  const cartId = await findCartId(owner);
  if (!cartId) return;
  await db.delete(cartItems).where(and(eq(cartItems.cartId, cartId), eq(cartItems.asin, asin)));
}

export async function setSaved(owner: CartOwner, asin: string, saved: boolean): Promise<void> {
  const cartId = await findCartId(owner);
  if (!cartId) return;
  await db
    .update(cartItems)
    .set({ savedForLater: saved })
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.asin, asin)));
}

// Sum of non-saved quantities, for the header's cart count.
export async function cartCount(owner: CartOwner): Promise<number> {
  const cartId = await findCartId(owner);
  if (!cartId) return 0;

  const rows = await db
    .select({ quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.savedForLater, false)));

  return rows.reduce((sum, row) => sum + row.quantity, 0);
}

// Folds a guest cart into a just-signed-in user's cart (Slice 6 calls this at sign-in): matching
// lines add their quantities (capped), the rest copy over as-is, and the guest cart is deleted
// either way so it can't be merged twice.
export async function mergeGuestCart(guestToken: string, userId: string): Promise<void> {
  const guestCartId = await findCartId({ guestToken });
  if (!guestCartId) return;

  const guestItems = await db.select().from(cartItems).where(eq(cartItems.cartId, guestCartId));
  if (guestItems.length === 0) {
    await db.delete(carts).where(eq(carts.id, guestCartId));
    return;
  }

  const userCartId = await getOrCreateCartId({ userId });
  const userItems = await db.select().from(cartItems).where(eq(cartItems.cartId, userCartId));
  const userByAsin = new Map(userItems.map((item) => [item.asin, item]));

  const asins = guestItems.map((item) => item.asin);
  const stockRows = await db.select({ asin: products.asin, stock: products.stock }).from(products).where(
    inArray(products.asin, asins),
  );
  const stockByAsin = new Map(stockRows.map((row) => [row.asin, row.stock]));

  for (const item of guestItems) {
    const stock = stockByAsin.get(item.asin) ?? 0;
    const existing = userByAsin.get(item.asin);
    const quantity = existing
      ? mergeQuantities(existing.quantity, item.quantity, stock)
      : capQuantity(item.quantity, stock);
    const savedForLater = existing ? existing.savedForLater : item.savedForLater;

    await db
      .insert(cartItems)
      .values({ cartId: userCartId, asin: item.asin, quantity, savedForLater })
      .onConflictDoUpdate({
        target: [cartItems.cartId, cartItems.asin],
        set: { quantity, savedForLater },
      });
  }

  // Cascades the guest's cart_items rows too (carts.id is their onDelete: "cascade" reference).
  await db.delete(carts).where(eq(carts.id, guestCartId));
}

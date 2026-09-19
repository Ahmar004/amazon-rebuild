// Input schemas for actions/cart.ts (docs/superpowers/plans/2026-09-19-slice-5-cart.md): "Server
// Actions in actions/cart.ts validate input with Zod, cap the quantity at min(stock, 30)". The
// stock cap itself happens in lib/data/cart.ts (it needs the product's live stock); these schemas
// only bound the shape and the 1-30 range before that.
import { z } from "zod";
import { MAX_CART_QUANTITY } from "@/lib/data/cart";

export const CART_REDIRECT_TARGETS = ["smart-wagon", "none"] as const;
export type CartRedirectTarget = (typeof CART_REDIRECT_TARGETS)[number];

export const asinSchema = z.string().trim().min(1).max(20);

export const addToCartInputSchema = z.object({
  asin: asinSchema,
  quantity: z.coerce.number().int().min(1).max(MAX_CART_QUANTITY),
  redirectTo: z.enum(CART_REDIRECT_TARGETS),
});
export type AddToCartInput = z.infer<typeof addToCartInputSchema>;

// setQuantity treats 0 as "delete the line" (lib/data/cart.ts), so 0 is a valid quantity here.
export const updateQuantityInputSchema = z.object({
  asin: asinSchema,
  quantity: z.coerce.number().int().min(0).max(MAX_CART_QUANTITY),
});
export type UpdateQuantityInput = z.infer<typeof updateQuantityInputSchema>;

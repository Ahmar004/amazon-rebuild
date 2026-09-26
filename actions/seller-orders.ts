"use server";

// Seller orders (frontend-rebuild.md D3): the seller marks a sold item shipped, then delivered, and
// the buyer's order timeline follows. lib/data/seller-orders.ts only moves items of products this
// seller listed, on orders that aren't cancelled.
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { markSoldItem } from "@/lib/data/seller-orders";
import { listingIdSchema } from "@/lib/validation/listing";
import { FULFILMENT_STEP, type FulfilmentStep } from "@/lib/constants/seller";
import { ROUTES } from "@/lib/constants/links";

export type SellerOrderResult = { ok: true } | { ok: false; error: string };

const orderIdSchema = z.string().trim().min(1).max(40);

async function move(orderId: string, asin: string, step: FulfilmentStep): Promise<SellerOrderResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  if (!orderIdSchema.safeParse(orderId).success || !listingIdSchema.safeParse(asin).success) {
    return { ok: false, error: "We couldn't find that sale." };
  }

  const moved = await markSoldItem(user.id, orderId, asin, step, new Date());
  if (!moved) return { ok: false, error: "This sale can't be updated. It may have been cancelled or already moved on." };
  revalidatePath(ROUTES.sellerOrders);
  revalidatePath(ROUTES.orders, "layout");
  return { ok: true };
}

export async function markShipped(orderId: string, asin: string): Promise<SellerOrderResult> {
  return move(orderId, asin, FULFILMENT_STEP.shipped);
}

export async function markDelivered(orderId: string, asin: string): Promise<SellerOrderResult> {
  return move(orderId, asin, FULFILMENT_STEP.delivered);
}

// Saved payment methods data layer (docs/design.md 5.3, 6.7). Card numbers never touch this
// database - only what Stripe returns about a saved PaymentMethod (brand, last4, expiry).
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { paymentMethods } from "@/lib/db/schema";

export type PaymentMethod = {
  id: string;
  stripePaymentMethodId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  nameOnCard: string;
  isDefault: boolean;
};

function toPaymentMethod(row: typeof paymentMethods.$inferSelect): PaymentMethod {
  return {
    id: row.id,
    stripePaymentMethodId: row.stripePaymentMethodId,
    brand: row.brand,
    last4: row.last4,
    expMonth: row.expMonth,
    expYear: row.expYear,
    nameOnCard: row.nameOnCard,
    isDefault: row.isDefault,
  };
}

export async function listPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  const rows = await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, userId))
    .orderBy(desc(paymentMethods.isDefault));
  return rows.map(toPaymentMethod);
}

// Ownership-checked: only a payment method belonging to userId can ever be selected at checkout.
export async function getPaymentMethod(userId: string, id: string): Promise<PaymentMethod | null> {
  const [row] = await db
    .select()
    .from(paymentMethods)
    .where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)))
    .limit(1);
  return row ? toPaymentMethod(row) : null;
}

export async function addPaymentMethod(
  userId: string,
  input: {
    stripePaymentMethodId: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    nameOnCard: string;
  },
): Promise<PaymentMethod> {
  const existingCount = await db
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, userId));

  const [row] = await db
    .insert(paymentMethods)
    .values({ ...input, userId, isDefault: existingCount.length === 0 })
    .onConflictDoUpdate({
      target: paymentMethods.stripePaymentMethodId,
      set: {
        brand: input.brand,
        last4: input.last4,
        expMonth: input.expMonth,
        expYear: input.expYear,
        nameOnCard: input.nameOnCard,
      },
    })
    .returning();
  return toPaymentMethod(row);
}

export async function removePaymentMethod(userId: string, id: string): Promise<void> {
  await db.delete(paymentMethods).where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)));
}

export async function setDefaultPaymentMethod(userId: string, id: string): Promise<void> {
  await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, userId));
  await db
    .update(paymentMethods)
    .set({ isDefault: true })
    .where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)));
}

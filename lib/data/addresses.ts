// Addresses data layer (docs/design.md 5.3, 6.7). Every function takes userId and filters by it
// in SQL, so one user can never read or change another user's address (CLAUDE.md ownership rule).
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { addresses } from "@/lib/db/schema";
import type { AddressInput } from "@/lib/validation/address";

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  instructions: string | null;
  isDefault: boolean;
};

function toAddress(row: typeof addresses.$inferSelect): Address {
  return {
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    zip: row.zip,
    instructions: row.instructions,
    isDefault: row.isDefault,
  };
}

export async function listAddresses(userId: string): Promise<Address[]> {
  const rows = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
  return rows.map(toAddress);
}

// Ownership-checked by id + userId in the WHERE clause, never by trusting the caller's id alone.
export async function getAddress(userId: string, id: string): Promise<Address | null> {
  const [row] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
    .limit(1);
  return row ? toAddress(row) : null;
}

// Inserts a new address, or updates one the caller already owns when input.id is set (the WHERE
// clause's userId match means an id for someone else's address silently updates nothing - the
// caller in actions/addresses.ts treats that as "not found").
export async function upsertAddress(userId: string, input: AddressInput): Promise<Address> {
  if (input.isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
  }

  const values = {
    fullName: input.fullName,
    phone: input.phone,
    line1: input.line1,
    line2: input.line2 || null,
    city: input.city,
    state: input.state,
    zip: input.zip,
    instructions: input.instructions || null,
    isDefault: input.isDefault,
  };

  if (input.id) {
    const [row] = await db
      .update(addresses)
      .set(values)
      .where(and(eq(addresses.id, input.id), eq(addresses.userId, userId)))
      .returning();
    if (row) return toAddress(row);
  }

  const [row] = await db
    .insert(addresses)
    .values({ ...values, userId })
    .returning();
  return toAddress(row);
}

export async function deleteAddress(userId: string, id: string): Promise<void> {
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
}

export async function setDefaultAddress(userId: string, id: string): Promise<void> {
  await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
  await db.update(addresses).set({ isDefault: true }).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
}

// User accounts (docs/design.md 5.3). Only actions/auth.ts calls these - components and pages
// never import the database client directly (CLAUDE.md architecture rule).
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export type UserRow = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
};

// Emails are stored lowercased (CLAUDE.md); callers pass an already-lowercased, trimmed email
// (lib/validation/auth.ts's parseIdentifier/registerSchema do that normalisation).
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return row ?? null;
}

export async function createUser(input: { name: string; email: string; passwordHash: string }): Promise<UserRow> {
  const [row] = await db.insert(users).values(input).returning();
  return row;
}

export type UserWithBilling = { id: string; email: string; name: string; stripeCustomerId: string | null };

export async function findUserById(id: string): Promise<UserWithBilling | null> {
  const [row] = await db
    .select({ id: users.id, email: users.email, name: users.name, stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return row ?? null;
}

// Used by actions/checkout.ts to persist the Stripe customer id once created (docs/design.md
// 6.7: "Ensures a Stripe customer").
export async function updateUser(userId: string, patch: { stripeCustomerId?: string }): Promise<void> {
  await db.update(users).set(patch).where(eq(users.id, userId));
}

// Customer Service requests (frontend-rebuild.md C18). Every query filters by the user, and a
// linked order must belong to the same user.
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, supportRequests } from "@/lib/db/schema";
import type { SupportStatus, SupportTopic } from "@/lib/constants/support";

export type SupportRequest = {
  id: string;
  orderId: string | null;
  topic: SupportTopic;
  subject: string;
  message: string;
  status: SupportStatus;
  createdAt: Date;
  closedAt: Date | null;
};

const COLUMNS = {
  id: supportRequests.id,
  orderId: supportRequests.orderId,
  topic: supportRequests.topic,
  subject: supportRequests.subject,
  message: supportRequests.message,
  status: supportRequests.status,
  createdAt: supportRequests.createdAt,
  closedAt: supportRequests.closedAt,
};

export async function userOwnsOrder(userId: string, orderId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);
  return !!row;
}

export async function createSupportRequest(
  userId: string,
  input: { topic: SupportTopic; orderId: string | null; subject: string; message: string },
): Promise<SupportRequest> {
  const [row] = await db
    .insert(supportRequests)
    .values({ userId, ...input })
    .returning(COLUMNS);
  return row;
}

export async function listSupportRequests(userId: string): Promise<SupportRequest[]> {
  return db.select(COLUMNS).from(supportRequests).where(eq(supportRequests.userId, userId)).orderBy(desc(supportRequests.createdAt));
}

export async function closeSupportRequest(userId: string, id: string): Promise<void> {
  await db
    .update(supportRequests)
    .set({ status: "closed", closedAt: new Date() })
    .where(and(eq(supportRequests.id, id), eq(supportRequests.userId, userId)));
}

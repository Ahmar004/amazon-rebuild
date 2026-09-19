// Session cookie lifecycle (docs/design.md 5.2, CLAUDE.md security rule): the session id is 32
// random bytes (hex) stored in `sessions` with a 30-day expiry, in the httpOnly `session` cookie.
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";

export const SESSION_COOKIE = "session";
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

// Pure: 32 random bytes as 64 hex characters. Exported so tests/unit/auth/session.test.ts can
// assert its shape without touching cookies() or the database.
export function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}

// Inserts the session row and sets the cookie. Mutates cookies() and the database, so only
// callable from a Server Action.
export async function createSession(userId: string): Promise<void> {
  const id = generateSessionId();
  const expiresAt = new Date(Date.now() + THIRTY_DAYS_SECONDS * 1000);

  await db.insert(sessions).values({ id, userId, expiresAt });

  const store = await cookies();
  store.set(SESSION_COOKIE, id, {
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

// Deletes the session row (if any) and clears the cookie. A missing or already-expired session
// is a no-op past the delete - signOut always ends up signed out either way.
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;

  if (id) await db.delete(sessions).where(eq(sessions.id, id));
  store.delete(SESSION_COOKIE);
}

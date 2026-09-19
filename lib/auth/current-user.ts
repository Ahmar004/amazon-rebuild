// The one session object every signed-in UI decision derives from (CLAUDE.md architecture rule).
// getCurrentUser reads the session cookie and joins it against `sessions`/`users`; React.cache
// dedupes it to one query per request no matter how many components call it.
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sessions, users } from "@/lib/db/schema";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants/links";

export type SessionUser = { id: string; email: string; name: string; firstName: string };

function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

// Reads cookies(), so callers render inside <Suspense> and never inside 'use cache'
// (CLAUDE.md's Next.js 16 caching rule). An unknown or expired session counts as signed out.
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) return null;

  return { id: row.id, email: row.email, name: row.name, firstName: firstNameOf(row.name) };
});

// Used by pages that require a signed-in user (checkout, account pages in later slices):
// redirects to /ap/signin?return_to=<encoded returnTo> when signed out, per docs/design.md 5.2.
export async function requireUser(returnTo: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`${ROUTES.signIn}?return_to=${encodeURIComponent(returnTo)}`);
  return user;
}

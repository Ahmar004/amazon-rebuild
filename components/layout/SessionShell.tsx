import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ROUTES } from "@/lib/constants/links";

// Session-dependent pieces of the shell. They read cookies(), so the layout renders each inside
// <Suspense>; getCurrentUser is React.cache-deduped, so they share one query per request. They
// are only small text slots: the menus that hold open/closed state stay outside Suspense, so a
// slot resolving never remounts (and closes) a menu the shopper already opened.

// Confirms the session behind the cookie proxy.ts let through is real and unexpired; otherwise
// the visitor goes to sign in (point 12).
export async function SessionGuard() {
  if (!(await getCurrentUser())) redirect(ROUTES.signIn);
  return null;
}

export async function UserFirstName() {
  return <>{(await getCurrentUser())?.firstName ?? "there"}</>;
}

export async function UserIdentity() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <>
      <p className="text-sm font-semibold text-fg">{user.name}</p>
      <p className="truncate text-xs text-fg-muted">{user.email}</p>
    </>
  );
}

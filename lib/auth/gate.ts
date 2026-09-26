// The sign-in gate (frontend-rebuild.md point 12): every page except sign-in and register needs an
// account. proxy.ts runs this on the session cookie's presence, which is a fast first check; the
// shop layout's SessionGuard then confirms the session is real, and every user-owned read or write
// still checks ownership on the server.
import { PUBLIC_PATHS, ROUTES } from "@/lib/constants/links";

export const SESSION_COOKIE = "session";

export type GateDecision = { type: "allow" } | { type: "redirect"; to: string } | { type: "unauthorized" };

export function signInHref(returnTo: string): string {
  return returnTo === "/" ? ROUTES.signIn : `${ROUTES.signIn}?return_to=${encodeURIComponent(returnTo)}`;
}

export function gateDecision(pathname: string, search: string, hasSession: boolean): GateDecision {
  if (hasSession || PUBLIC_PATHS.includes(pathname)) return { type: "allow" };
  if (pathname.startsWith("/api/")) return { type: "unauthorized" };
  return { type: "redirect", to: signInHref(pathname + search) };
}

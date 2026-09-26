import { NextResponse, type NextRequest } from "next/server";
import { gateDecision, SESSION_COOKIE } from "@/lib/auth/gate";

// Sign-in gate (point 12): a visitor with no session cookie goes to /signin, and API routes answer
// 401 (lib/auth/gate.ts). SessionGuard in the layouts catches a cookie whose session has expired.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const decision = gateDecision(pathname, search, request.cookies.has(SESSION_COOKIE));
  if (decision.type === "redirect") return NextResponse.redirect(new URL(decision.to, request.url));
  if (decision.type === "unauthorized") return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt).*)"],
};

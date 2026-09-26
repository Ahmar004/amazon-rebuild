import { NextResponse, type NextRequest } from "next/server";
import { gateDecision, SESSION_COOKIE } from "@/lib/auth/gate";

// 1. Holding page (frontend-rebuild.md C5): production shows "Shopeedo - coming soon" until the
//    rebuilt UI ships. Local dev and preview deployments serve the full app. Remove this in R12.
// 2. Sign-in gate (point 12): a visitor with no session cookie goes to /signin (lib/auth/gate.ts).
export function proxy(request: NextRequest) {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.rewrite(new URL("/coming-soon.html", request.url));
  }

  const { pathname, search } = request.nextUrl;
  const decision = gateDecision(pathname, search, request.cookies.has(SESSION_COOKIE));
  if (decision.type === "redirect") return NextResponse.redirect(new URL(decision.to, request.url));
  if (decision.type === "unauthorized") return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|coming-soon\\.html|robots\\.txt).*)"],
};

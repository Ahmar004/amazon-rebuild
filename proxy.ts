import { NextResponse, type NextRequest } from "next/server";

// Holding page (frontend-rebuild.md C5): production shows "Shopeedo - coming soon"
// until the rebuilt UI ships, so the old Amazon-styled build never reaches the live domain.
// Local dev and preview deployments still serve the full app. Delete this file in R12.
export function proxy(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return NextResponse.next();
  return NextResponse.rewrite(new URL("/coming-soon.html", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|coming-soon\\.html|robots\\.txt).*)"],
};

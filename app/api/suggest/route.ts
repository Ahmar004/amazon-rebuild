import { NextResponse } from "next/server";
import { suggest } from "@/lib/data/search";

// GET /api/suggest?q=<prefix> -> { suggestions: string[] } for the header typeahead
// (docs/design.md 6.3, hooks/useTypeahead.ts).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const suggestions = await suggest(q);
  return NextResponse.json({ suggestions });
}

import { cookies } from "next/headers";
import {
  DEFAULT_LOCATION,
  LOCATION_COOKIE,
  LOCATION_PROMPT_COOKIE,
  parseLocationCookie,
} from "@/lib/location";
import { DeliverToButton } from "@/components/layout/DeliverToButton";

// Server island for the header's "Deliver to" block (Task 3): reads the deliver_to and
// loc_prompt cookies. cookies() is async and must stay outside 'use cache' and inside
// <Suspense> (app/(shop)/layout.tsx), per CLAUDE.md's Next.js 16 caching rules.
export async function DeliverTo() {
  const store = await cookies();
  const location = parseLocationCookie(store.get(LOCATION_COOKIE)?.value);
  const showPrompt = !store.has(LOCATION_PROMPT_COOKIE);

  return <DeliverToButton location={location} showPrompt={showPrompt} />;
}

// Suspense fallback: same block, default location, prompt withheld until the real cookie read
// resolves - so the header doesn't shift once DeliverTo streams in.
export function DeliverToFallback() {
  return <DeliverToButton location={DEFAULT_LOCATION} showPrompt={false} />;
}

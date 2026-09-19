import { cookies } from "next/headers";
import {
  DEFAULT_LOCATION,
  LOCATION_COOKIE,
  LOCATION_PROMPT_COOKIE,
  parseLocationCookie,
} from "@/lib/location";
import { DeliverToButton } from "@/components/layout/DeliverToButton";

type DeliverToVariantProps = {
  /** "mobile" renders HeaderMobile's row 4 instead of the desktop header item (Task 4). */
  variant?: "desktop" | "mobile";
};

// Server island for the header's "Deliver to" block (Task 3): reads the deliver_to and
// loc_prompt cookies. cookies() is async and must stay outside 'use cache' and inside
// <Suspense> (app/(shop)/layout.tsx), per CLAUDE.md's Next.js 16 caching rules.
export async function DeliverTo({ variant = "desktop" }: DeliverToVariantProps) {
  const store = await cookies();
  const location = parseLocationCookie(store.get(LOCATION_COOKIE)?.value);
  const showPrompt = !store.has(LOCATION_PROMPT_COOKIE);

  return <DeliverToButton location={location} showPrompt={showPrompt} variant={variant} />;
}

// Suspense fallback: same block, default location, prompt withheld until the real cookie read
// resolves - so the header doesn't shift once DeliverTo streams in.
export function DeliverToFallback({ variant = "desktop" }: DeliverToVariantProps) {
  return <DeliverToButton location={DEFAULT_LOCATION} showPrompt={false} variant={variant} />;
}

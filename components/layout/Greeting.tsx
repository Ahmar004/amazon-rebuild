import { getCurrentUser } from "@/lib/auth/current-user";
import { AccountFlyout } from "@/components/layout/AccountFlyout";

// Reads the session (docs/design.md 6.1: "<Greeting/> (reads the session)") and feeds it to the
// client AccountFlyout. cookies() is read here, so app/(shop)/layout.tsx renders this inside
// <Suspense> with AccountFlyout's signed-out state as the fallback - no layout shift once it
// streams in.
export async function Greeting() {
  const user = await getCurrentUser();
  return <AccountFlyout user={user} />;
}

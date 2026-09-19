import { getCurrentUser } from "@/lib/auth/current-user";
import { SignInBand } from "@/components/home/SignInBand";

type SignInBandSessionProps = {
  variant?: "desktop" | "mobile";
};

// Renders the sign-in band only when signed out (docs/design.md 6.2: "The sign-in band renders
// only when signed out: a small Suspense part reads the session; signed-in users get
// HistoryStrip instead" - HistoryStrip is a later slice's work, so signed-in users just see
// nothing here for now). Reads cookies(), so Home renders it inside <Suspense> even though Home
// itself is 'use cache' (CLAUDE.md caching rule).
export async function SignInBandSession({ variant = "desktop" }: SignInBandSessionProps) {
  const user = await getCurrentUser();
  if (user) return null;
  return <SignInBand variant={variant} />;
}

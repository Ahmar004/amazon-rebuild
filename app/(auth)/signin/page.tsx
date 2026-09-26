import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { safeReturnTo } from "@/lib/auth/return-to";
import { AuthCard, AuthCardSkeleton } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";

type Props = { searchParams: Promise<{ return_to?: string; email?: string }> };

// /signin: the gate every signed-out visitor lands on (point 12, C11). getCurrentUser() reads
// cookies(), so the check and the form render inside <Suspense> (CLAUDE.md caching rule).
export default function SignInPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <SignInContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SignInContent({ searchParams }: Props) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.return_to);
  if (await getCurrentUser()) redirect(returnTo);

  return (
    <AuthCard mode="signin" returnTo={returnTo} title="Welcome back" subtitle="Sign in to shop, track orders and check out faster.">
      <SignInForm returnTo={returnTo} email={params.email} />
    </AuthCard>
  );
}

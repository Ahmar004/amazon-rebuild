import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { safeReturnTo } from "@/lib/auth/return-to";
import { AuthBox } from "@/components/auth/AuthBox";
import { IdentifyForm } from "@/components/auth/IdentifyForm";

type SignInPageProps = {
  searchParams: Promise<{ return_to?: string; email?: string }>;
};

// /ap/signin: step 1 of "Sign in or create account" (docs/design.md 6.6). getCurrentUser() reads
// cookies(), so the redirect check and the form live inside <Suspense> (CLAUDE.md caching rule).
export default function SignInPage({ searchParams }: SignInPageProps) {
  return (
    <Suspense fallback={<AuthBoxSkeleton />}>
      <SignInContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SignInContent({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.return_to);

  const user = await getCurrentUser();
  if (user) redirect(returnTo);

  return (
    <AuthBox title="Sign in or create account">
      <IdentifyForm returnTo={returnTo} />
    </AuthBox>
  );
}

function AuthBoxSkeleton() {
  return (
    <div
      className="h-[260px] w-full max-w-[350px] animate-pulse rounded-xl border border-border bg-surface"
      aria-hidden="true"
    />
  );
}

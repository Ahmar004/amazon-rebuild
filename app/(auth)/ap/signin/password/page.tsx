import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { safeReturnTo } from "@/lib/auth/return-to";
import { ROUTES } from "@/lib/constants/links";
import { AuthBox } from "@/components/auth/AuthBox";
import { PasswordForm } from "@/components/auth/PasswordForm";

type PasswordPageProps = {
  searchParams: Promise<{ return_to?: string; email?: string }>;
};

// /ap/signin/password: step 2 for a known email (docs/design.md 6.6).
export default function SignInPasswordPage({ searchParams }: PasswordPageProps) {
  return (
    <Suspense fallback={<AuthBoxSkeleton />}>
      <PasswordContent searchParams={searchParams} />
    </Suspense>
  );
}

async function PasswordContent({ searchParams }: PasswordPageProps) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.return_to);
  const email = (params.email ?? "").trim().toLowerCase();

  // No email means someone landed here directly - send them back to step 1 with return_to kept.
  if (!email) redirect(`${ROUTES.signIn}?return_to=${encodeURIComponent(returnTo)}`);

  const user = await getCurrentUser();
  if (user) redirect(returnTo);

  return (
    <AuthBox title="Sign in">
      <PasswordForm email={email} returnTo={returnTo} />
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

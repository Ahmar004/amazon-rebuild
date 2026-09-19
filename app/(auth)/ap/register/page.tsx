import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { safeReturnTo } from "@/lib/auth/return-to";
import { ROUTES } from "@/lib/constants/links";
import { AuthBox } from "@/components/auth/AuthBox";
import { RegisterForm } from "@/components/auth/RegisterForm";

type RegisterPageProps = {
  searchParams: Promise<{ return_to?: string; email?: string }>;
};

// /ap/register: step 2 for an unknown email - "Create account" (docs/design.md 6.6).
export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return (
    <Suspense fallback={<AuthBoxSkeleton />}>
      <RegisterContent searchParams={searchParams} />
    </Suspense>
  );
}

async function RegisterContent({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.return_to);
  const email = (params.email ?? "").trim().toLowerCase();

  if (!email) redirect(`${ROUTES.signIn}?return_to=${encodeURIComponent(returnTo)}`);

  const user = await getCurrentUser();
  if (user) redirect(returnTo);

  return (
    <AuthBox title="Create account">
      <RegisterForm email={email} returnTo={returnTo} />
    </AuthBox>
  );
}

function AuthBoxSkeleton() {
  return (
    <div
      className="h-[420px] w-full max-w-[350px] animate-pulse rounded-lg border border-border bg-white"
      aria-hidden="true"
    />
  );
}

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { safeReturnTo } from "@/lib/auth/return-to";
import { AuthCard, AuthCardSkeleton } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

type Props = { searchParams: Promise<{ return_to?: string }> };

// /register: create an account on one screen (C11). Reads the session, so it renders in <Suspense>.
export default function RegisterPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <RegisterContent searchParams={searchParams} />
    </Suspense>
  );
}

async function RegisterContent({ searchParams }: Props) {
  const returnTo = safeReturnTo((await searchParams).return_to);
  if (await getCurrentUser()) redirect(returnTo);

  return (
    <AuthCard mode="register" returnTo={returnTo} title="Create your account" subtitle="It takes a few seconds, and your cart and orders stay with you.">
      <RegisterForm returnTo={returnTo} />
    </AuthCard>
  );
}

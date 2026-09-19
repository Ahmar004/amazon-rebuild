import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { PersonIcon } from "@/components/layout/PersonIcon";
import { ROUTES } from "@/lib/constants/links";

// HeaderMobile's account link: "Sign in >" (signed out) or "<firstName> >" (signed in), both
// with the person icon, linking to /ap/signin or /your-account respectively (docs/superpowers/
// plans/2026-09-19-slice-6-auth.md: "The mobile header shows 'Ahmar >' with the person icon,
// linking to /your-account"). Reads the session, so HeaderMobile renders it inside <Suspense>.
export async function HeaderMobileAccount() {
  const user = await getCurrentUser();
  return <HeaderMobileAccountLink label={user ? user.firstName : "Sign in"} href={user ? ROUTES.account : ROUTES.signIn} />;
}

export function HeaderMobileAccountFallback() {
  return <HeaderMobileAccountLink label="Sign in" href={ROUTES.signIn} />;
}

function HeaderMobileAccountLink({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm text-white">
      {label} &#8250;
      <PersonIcon className="shrink-0 text-white" />
    </Link>
  );
}

import Link from "next/link";
import { ROUTES } from "@/lib/constants/links";

type SignInBandProps = {
  variant?: "desktop" | "mobile";
};

// "See personalized recommendations" band, shown unconditionally in this slice (auth lands in
// Slice 6, which will switch it on the session instead - see docs/design.md 6.2). Desktop and
// mobile read differently enough (heading, button width, copy) to need their own branch here
// rather than two near-duplicate components.
export function SignInBand({ variant = "desktop" }: SignInBandProps) {
  if (variant === "mobile") {
    return (
      <div className="border-t border-border bg-white px-4 py-5 text-center">
        <h2 className="text-xl font-bold text-text">Sign in for the best experience</h2>
        <Link
          href={ROUTES.signIn}
          className="mt-3 block rounded-lg border border-btn-yellow-border bg-btn-yellow py-2 text-sm font-medium text-text"
        >
          Sign in securely
        </Link>
        <Link href={ROUTES.register} className="mt-3 block text-[13px] text-link hover:text-link-hover hover:underline">
          Create an account
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-white px-5 py-6 text-center">
      <h2 className="text-[21px] font-bold text-text">See personalized recommendations</h2>
      <Link
        href={ROUTES.signIn}
        className="mx-auto mt-3 block w-[250px] rounded-lg border border-btn-yellow-border bg-btn-yellow py-2 text-sm font-medium text-text hover:bg-btn-yellow-hover"
      >
        Sign in
      </Link>
      <p className="mt-3 text-[11px] text-text">
        New customer?{" "}
        <Link href={ROUTES.register} className="text-link hover:text-link-hover hover:underline">
          Start here.
        </Link>
      </p>
    </div>
  );
}

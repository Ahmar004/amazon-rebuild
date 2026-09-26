import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { BEST_SELLERS_HREF, ROUTES } from "@/lib/constants/links";

type EmptyCartProps = {
  /** true when the cart has saved-for-later items below it: skip the illustration/sign-in CTAs
   * and show just the message. */
  compact?: boolean;
  /** Hides the sign-in/sign-up buttons for a signed-in user (Slice 6). */
  signedIn?: boolean;
};

// The empty-cart state: a cart icon, a link back to shopping, and (guests only) sign-in/sign-up.
export function EmptyCart({ compact = false, signedIn = false }: EmptyCartProps) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <h1 className="text-2xl text-fg">Your cart is empty</h1>
        <Link href={BEST_SELLERS_HREF} className="text-accent hover:text-accent-hover">
          Browse best sellers
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-8 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-accent">
        <ShoppingCart size={36} aria-hidden="true" />
      </span>
      <h1 className="text-2xl text-fg">Your cart is empty</h1>
      <Link href={BEST_SELLERS_HREF} className="text-accent hover:text-accent-hover">
        Browse best sellers
      </Link>
      {!signedIn && (
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Link
            href={ROUTES.signIn}
            className="rounded-full border border-accent bg-accent px-6 py-1.5 text-sm text-accent-fg hover:bg-accent-hover"
          >
            Sign in to your account
          </Link>
          <Link
            href={ROUTES.register}
            className="rounded-full border border-border bg-surface px-6 py-1.5 text-sm text-fg hover:bg-surface-muted"
          >
            Sign up now
          </Link>
        </div>
      )}
    </div>
  );
}

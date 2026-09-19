import Link from "next/link";
import { EMPTY_CART_IMAGE } from "@/lib/assets";
import { ROUTES } from "@/lib/constants/links";

type EmptyCartProps = {
  /** true when the cart has saved-for-later items below it: skip the illustration/sign-in CTAs
   * and show just the message, matching amazon.com's shopping-cart box in that state. */
  compact?: boolean;
  /** Hides the sign-in/sign-up buttons for a signed-in user (Slice 6). */
  signedIn?: boolean;
};

// "Your Amazon Cart is empty" (recon docs/recon/4-shopping-cart-*): the kettle illustration, a
// "Shop today's deals" link, and (guests only) sign-in/sign-up.
export function EmptyCart({ compact = false, signedIn = false }: EmptyCartProps) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <h1 className="text-2xl text-text">Your Amazon Cart is empty</h1>
        <Link href={ROUTES.deals} className="text-link hover:text-link-hover">
          Shop today&apos;s deals
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-white p-8 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={EMPTY_CART_IMAGE} alt="" aria-hidden="true" className="h-32 w-32" />
      <h1 className="text-2xl text-text">Your Amazon Cart is empty</h1>
      <Link href={ROUTES.deals} className="text-link hover:text-link-hover">
        Shop today&apos;s deals
      </Link>
      {!signedIn && (
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Link
            href={ROUTES.signIn}
            className="rounded-full border border-btn-yellow-border bg-btn-yellow px-6 py-1.5 text-sm text-text hover:bg-btn-yellow-hover"
          >
            Sign in to your account
          </Link>
          <Link
            href={ROUTES.register}
            className="rounded-full border border-border bg-white px-6 py-1.5 text-sm text-text hover:bg-search-dept"
          >
            Sign up now
          </Link>
        </div>
      )}
    </div>
  );
}

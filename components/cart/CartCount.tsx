import { CartLink } from "@/components/layout/CartLink";
import { getCartOwner } from "@/lib/cart-owner";
import { cartCount } from "@/lib/data/cart";

type CartCountProps = {
  variant?: "desktop" | "mobile";
};

// Reads the owner and the live cart count on every page (cookies-backed, so it's read-only and
// never cached), rendered inside <Suspense> by app/(shop)/layout.tsx. A visitor with no cart_token
// cookie yet has never added anything, so the count is 0 without a database round trip.
export async function CartCount({ variant }: CartCountProps) {
  const owner = await getCartOwner();
  const count = owner ? await cartCount(owner) : 0;
  return <CartLink count={count} variant={variant} />;
}

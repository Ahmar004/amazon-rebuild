import Link from "next/link";
import { formatPrice } from "@/lib/pricing/money";

type SubtotalBoxProps = {
  itemCount: number;
  subtotalCents: number;
  /** Where "Proceed to checkout" goes: /checkout when signed in, otherwise /ap/signin with
   * return_to=/checkout (docs/design.md 6.5, Slice 6). */
  checkoutHref: string;
};

// The right rail on /cart: "Subtotal (n items): $x" and the yellow "Proceed to checkout" button.
// Checkout itself arrives in Slice 7; Slice 6 makes signed-out visitors sign in first.
export function SubtotalBox({ itemCount, subtotalCents, checkoutHref }: SubtotalBoxProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-lg text-text">
        Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
        <span className="font-bold">{formatPrice(subtotalCents)}</span>
      </p>
      <Link
        href={checkoutHref}
        className="mt-3 block w-full rounded-full border border-btn-yellow-border bg-btn-yellow px-3 py-1.5 text-center text-sm text-text hover:bg-btn-yellow-hover"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}

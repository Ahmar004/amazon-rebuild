import Link from "next/link";
import { formatPrice } from "@/lib/pricing/money";
import { countLabel } from "@/lib/format/count";

type SubtotalBoxProps = {
  itemCount: number;
  subtotalCents: number;
  /** Where "Proceed to checkout" goes: /checkout when signed in, otherwise /signin with
   * return_to=/checkout */
  checkoutHref: string;
};

// The right rail on /cart: "Subtotal (n items): $x" and the "Proceed to checkout" button.
// Checkout itself arrives in Slice 7; Slice 6 makes signed-out visitors sign in first.
export function SubtotalBox({ itemCount, subtotalCents, checkoutHref }: SubtotalBoxProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-lg text-fg">
        Subtotal ({countLabel(itemCount, "item")}):{" "}
        <span className="font-bold">{formatPrice(subtotalCents)}</span>
      </p>
      <Link
        href={checkoutHref}
        className="mt-3 block w-full rounded-full border border-accent bg-accent px-3 py-1.5 text-center text-sm text-accent-fg hover:bg-accent-hover"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}

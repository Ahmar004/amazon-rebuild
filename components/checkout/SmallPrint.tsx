import Link from "next/link";
import { SafetyNotice } from "@/components/layout/SafetyNotice";
import { ROUTES } from "@/lib/constants/links";

// The short print below the checkout sections, plus the demo notice.
export function SmallPrint() {
  return (
    <section className="space-y-2 px-1 text-xs text-fg-muted">
      <p>
        Tax is estimated from your delivery address. You can cancel an order until it ships from{" "}
        <Link href={ROUTES.orders} className="text-accent hover:underline">
          Your Orders
        </Link>
        . Questions?{" "}
        <Link href={ROUTES.customerService} className="text-accent hover:underline">
          Customer Service
        </Link>{" "}
        can help.
      </p>
      <Link href={ROUTES.cart} className="inline-block font-semibold text-accent hover:underline">
        Back to cart
      </Link>
      <SafetyNotice />
    </section>
  );
}

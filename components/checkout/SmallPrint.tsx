import Link from "next/link";
import { SafetyNotice } from "@/components/layout/SafetyNotice";
import { ROUTES } from "@/lib/constants/links";

// The small-print block below the checkout steps, plus the demo notice.
export function SmallPrint() {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 text-xs text-fg">
      <p>Sales tax is calculated from your shipping address.</p>
      <p className="mt-2">
        Do you need help? Explore our{" "}
        <Link href={ROUTES.customerService} className="text-accent hover:text-accent-hover hover:underline">
          Help pages
        </Link>{" "}
        or{" "}
        <Link href={ROUTES.customerService} className="text-accent hover:text-accent-hover hover:underline">
          contact us
        </Link>
      </p>
      <p className="mt-2">
        When you click the &quot;Place your order&quot; button, we&apos;ll send you
        an email message acknowledging receipt of your order. Your contract to purchase an item will not be
        complete until we send you an email notifying you that the item has been shipped.
      </p>
      <p className="mt-2">
        Within 30 days of delivery, you may return new, unopened merchandise in its original condition.
        Exceptions and restrictions apply. See our{" "}
        <Link href={`${ROUTES.customerService}/returns`} className="text-accent hover:text-accent-hover hover:underline">
          Returns Policy
        </Link>
      </p>
      <Link href={ROUTES.cart} className="mt-3 inline-block text-accent hover:text-accent-hover hover:underline">
        Back to cart
      </Link>
      <SafetyNotice className="mt-4" />
    </section>
  );
}

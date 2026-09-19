import Link from "next/link";
import { SafetyNotice } from "@/components/layout/SafetyNotice";
import { ROUTES, TAX_AND_SELLER_INFO_URL } from "@/lib/constants/links";

// The small-print block below the checkout steps (docs/spec.md 5.8, recon
// 6-we-reach-checkout-page-after-email-verification-and-mobile-phone-verification.png), plus the
// mandatory SafetyNotice (CLAUDE.md: every checkout box keeps the demo disclaimer).
export function SmallPrint() {
  return (
    <section className="rounded-lg bg-white p-4 text-xs text-text">
      <p>
        Why has sales tax been applied?{" "}
        <a
          href={TAX_AND_SELLER_INFO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link hover:text-link-hover hover:underline"
        >
          See tax and seller information.
        </a>
      </p>
      <p className="mt-2">
        Do you need help? Explore our{" "}
        <Link href={ROUTES.customerService} className="text-link hover:text-link-hover hover:underline">
          Help pages
        </Link>{" "}
        or{" "}
        <Link href={ROUTES.customerService} className="text-link hover:text-link-hover hover:underline">
          contact us
        </Link>
      </p>
      <p className="mt-2">
        For an item sold by Amazon.com: When you click the &quot;Place your order&quot; button, we&apos;ll send you
        an email message acknowledging receipt of your order. Your contract to purchase an item will not be
        complete until we send you an email notifying you that the item has been shipped.
      </p>
      <p className="mt-2">
        Within 30 days of delivery, you may return new, unopened merchandise in its original condition.
        Exceptions and restrictions apply. See Amazon&apos;s{" "}
        <Link href={`${ROUTES.customerService}/returns`} className="text-link hover:text-link-hover hover:underline">
          Returns Policy
        </Link>
      </p>
      <Link href={ROUTES.cart} className="mt-3 inline-block text-link hover:text-link-hover hover:underline">
        Back to cart
      </Link>
      <SafetyNotice className="mt-4" />
    </section>
  );
}

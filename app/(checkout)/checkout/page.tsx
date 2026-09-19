import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { getCartOwner } from "@/lib/cart-owner";
import { resolveCheckoutSource } from "@/lib/checkout/source";
import { listAddresses } from "@/lib/data/addresses";
import { listPaymentMethods } from "@/lib/data/payments";
import { quoteCheckout } from "@/actions/checkout";
import { ROUTES } from "@/lib/constants/links";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

// /checkout (docs/design.md 6.7): "calls requireUser('/checkout') and loads the source items,
// either the cart's non-saved lines or buy=<asin>:<qty>. It redirects to /cart when there are
// none." Reads cookies() and searchParams, so it renders dynamically inside <Suspense>, never
// under 'use cache' (CLAUDE.md's Next.js 16 caching rule).
export default function CheckoutPage({ searchParams }: { searchParams: Promise<{ buy?: string }> }) {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutForParams searchParams={searchParams} />
    </Suspense>
  );
}

async function CheckoutForParams({ searchParams }: { searchParams: Promise<{ buy?: string }> }) {
  const { buy } = await searchParams;
  const user = await requireUser(buy ? `${ROUTES.checkout}?buy=${encodeURIComponent(buy)}` : ROUTES.checkout);

  const owner = await getCartOwner();
  const source = await resolveCheckoutSource(owner, buy);
  if (source.lines.length === 0) redirect(ROUTES.cart);

  const [addresses, paymentMethods] = await Promise.all([listAddresses(user.id), listPaymentMethods(user.id)]);
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  const defaultPaymentMethod = paymentMethods.find((p) => p.isDefault) ?? paymentMethods[0] ?? null;

  const initialQuote = await quoteCheckout({ addressId: defaultAddress?.id ?? null, speed: "standard", buy });

  return (
    <CheckoutClient
      items={source.lines}
      buy={source.kind === "buy" ? source.buy : undefined}
      addresses={addresses}
      paymentMethods={paymentMethods}
      defaultAddressId={defaultAddress?.id ?? null}
      defaultPaymentMethodId={defaultPaymentMethod?.id ?? null}
      initialQuote={initialQuote}
    />
  );
}

function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6" aria-hidden="true">
      <div className="h-[500px] animate-pulse rounded-lg bg-white" />
    </div>
  );
}

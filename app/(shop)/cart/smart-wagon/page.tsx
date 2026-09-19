import { Suspense } from "react";
import Link from "next/link";
import { getCartOwner } from "@/lib/cart-owner";
import { getCart } from "@/lib/data/cart";
import { getProduct, getRelated } from "@/lib/data/products";
import { formatPrice } from "@/lib/pricing/money";
import { ROUTES } from "@/lib/constants/links";
import { imageAt } from "@/lib/assets";
import { MiniCart } from "@/components/cart/MiniCart";
import { Carousel } from "@/components/product/Carousel";

const RELATED_CAROUSEL_SIZE = 20;

type SmartWagonPageProps = {
  searchParams: Promise<{ asin?: string; qty?: string }>;
};

// The "Added to cart" interstitial addToCart redirects to (recon docs/recon/3-add-to-cart-*.png):
// left panel confirms the item, right panel + MiniCart show the live cart, below is a related
// carousel. Reads the cart_token cookie, so it renders inside <Suspense>.
export default function SmartWagonPage({ searchParams }: SmartWagonPageProps) {
  return (
    <Suspense fallback={<SmartWagonSkeleton />}>
      <SmartWagonContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SmartWagonContent({ searchParams }: SmartWagonPageProps) {
  const { asin } = await searchParams;
  const owner = await getCartOwner();
  const signedIn = owner !== null && "userId" in owner;
  const checkoutHref = signedIn ? ROUTES.checkout : `${ROUTES.signIn}?return_to=${encodeURIComponent(ROUTES.checkout)}`;
  const cart = owner ? await getCart(owner) : { lines: [], saved: [], subtotalCents: 0, itemCount: 0 };

  // "An unknown asin parameter falls back to showing the cart summary only" (plan): this also
  // covers an asin that isn't actually a line in this owner's cart (a stale or forged link).
  const addedLine = asin ? cart.lines.find((line) => line.asin === asin) : undefined;
  const product = addedLine ? await getProduct(asin!) : null;
  const related = product ? (await getRelated(product.asin, product.departmentSlug)).slice(0, RELATED_CAROUSEL_SIZE) : [];
  const itemsLabel = `${cart.itemCount} ${cart.itemCount === 1 ? "item" : "items"}`;

  return (
    <div className="min-h-[60vh] bg-page-bg px-4 py-6">
      <div className="mx-auto flex max-w-[1200px] gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            {product ? (
              <div className="flex items-center gap-4">
                {product.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageAt(product.imageUrl, "SY100")}
                    alt={product.title}
                    className="h-[100px] w-[100px] object-contain"
                  />
                )}
                <div className="flex items-center gap-2">
                  <CheckIcon />
                  <span className="text-lg font-bold text-text">Added to cart</span>
                </div>
              </div>
            ) : (
              <p className="text-lg text-text">Your Cart</p>
            )}

            <div className="flex flex-col gap-2 sm:w-[260px]">
              <p className="text-sm text-text">
                Cart Subtotal: <span className="font-bold">{formatPrice(cart.subtotalCents)}</span>
              </p>
              <Link
                href={checkoutHref}
                className="rounded-full border border-btn-yellow-border bg-btn-yellow px-3 py-1.5 text-center text-sm text-text hover:bg-btn-yellow-hover"
              >
                Proceed to checkout ({itemsLabel})
              </Link>
              <Link
                href={ROUTES.cart}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-center text-sm text-text hover:bg-search-dept"
              >
                Go to Cart
              </Link>
            </div>
          </div>

          {product && related.length > 0 && (
            <div className="mt-8">
              <Carousel title={`Products related to ${product.title}`} items={related} />
            </div>
          )}
        </div>

        <MiniCart cart={cart} />
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="var(--color-in-stock)" strokeWidth="1.5" />
      <path
        d="M7 12.5l3 3 7-7"
        stroke="var(--color-in-stock)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SmartWagonSkeleton() {
  return (
    <div className="min-h-[60vh] bg-page-bg px-4 py-6" aria-hidden="true">
      <div className="mx-auto h-[300px] max-w-[1200px] animate-pulse rounded-lg bg-white" />
    </div>
  );
}

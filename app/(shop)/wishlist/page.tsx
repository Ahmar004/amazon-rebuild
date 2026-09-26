import { Suspense } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getWishlist, type WishlistItem } from "@/lib/data/wishlist";
import { formatPrice } from "@/lib/pricing/money";
import { ROUTES } from "@/lib/constants/links";
import { ProductCard } from "@/components/product/ProductCard";
import { buttonClass } from "@/components/ui/Button";

export const metadata = { title: "Your Wishlist - Shopeedo" };

// The one wishlist (frontend-rebuild.md C14). User-owned, so it renders at request time inside
// <Suspense>. Unhearting a card removes it: the action revalidates this page.
export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-6 sm:py-6">
      <h1 className="text-xl font-bold text-fg sm:text-2xl">Your Wishlist</h1>
      <Suspense fallback={<GridSkeleton />}>
        <WishlistItems />
      </Suspense>
    </div>
  );
}

async function WishlistItems() {
  const user = await requireUser(ROUTES.wishlist);
  const items = await getWishlist(user.id);

  if (items.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
        <Heart size={40} className="text-fg-muted" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-bold text-fg">Your wishlist is empty</h2>
        <p className="mt-1 max-w-sm text-sm text-fg-muted">Tap the heart on any product to save it here for later.</p>
        <Link href={ROUTES.home} className={buttonClass({ className: "mt-5" })}>
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mt-0.5 text-sm text-fg-muted">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <li key={item.asin}>
            <ProductCard item={item} note={<PriceNote item={item} />} />
          </li>
        ))}
      </ul>
    </>
  );
}

function PriceNote({ item }: { item: WishlistItem }) {
  const drop = item.priceAtAddCents - item.priceCents;
  if (drop > 0) {
    return <p className="mt-1 text-xs font-semibold text-success">Price dropped {formatPrice(drop)} since you added it</p>;
  }
  return <p className="mt-1 text-xs text-fg-muted">Added {item.addedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>;
}

function GridSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton h-[380px] rounded-xl" />
      ))}
    </div>
  );
}

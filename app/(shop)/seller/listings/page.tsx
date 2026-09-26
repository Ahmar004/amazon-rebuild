import { Suspense } from "react";
import Link from "next/link";
import { PackagePlus, Store } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getSellerListings } from "@/lib/data/listings";
import { ROUTES } from "@/lib/constants/links";
import { buttonClass } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListingList } from "@/components/listings/ListingList";
import { countLabel } from "@/lib/format/count";

export const metadata = { title: "Your listings - Shopeedo" };

// "Your listings" (point 15): everything the user sells, with edit, pause and delete. User-owned,
// so it renders at request time inside <Suspense>.
export default function SellerListingsPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-3 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-fg sm:text-2xl">Your listings</h1>
        <Link href={ROUTES.sellItem} className={buttonClass({ className: "rounded-full" })}>
          <PackagePlus size={16} aria-hidden="true" />
          Sell an item
        </Link>
      </div>
      <Suspense fallback={<ListSkeleton />}>
        <Listings />
      </Suspense>
    </div>
  );
}

async function Listings() {
  const user = await requireUser(ROUTES.sellerListings);
  const listings = await getSellerListings(user.id);

  if (listings.length === 0) {
    return (
      <EmptyState icon={Store} title="You haven't listed anything yet" action={{ label: "Sell an item", href: ROUTES.sellItem }}>
        Add a few photos, a title and a price, and your item goes straight into search for every Shopeedo shopper.
      </EmptyState>
    );
  }

  return (
    <>
      <p className="mb-4 mt-0.5 text-sm text-fg-muted">
        {countLabel(listings.length, "listing")}
      </p>
      <ListingList listings={listings} />
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="mt-6 space-y-3" aria-hidden="true">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="skeleton h-28 rounded-xl" />
      ))}
    </div>
  );
}

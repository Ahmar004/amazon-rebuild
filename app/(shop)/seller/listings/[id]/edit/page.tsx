import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { getCategories } from "@/lib/data/categories";
import { getOwnListing } from "@/lib/data/listings";
import { editListingHref } from "@/lib/constants/links";
import { ListingForm } from "@/components/listings/ListingForm";

export const metadata = { title: "Edit listing - Shopeedo" };

type EditListingPageProps = { params: Promise<{ id: string }> };

// Edit one of the seller's listings. Another seller's id gets a 404, never the form.
export default function EditListingPage({ params }: EditListingPageProps) {
  return (
    <div className="mx-auto max-w-[860px] px-3 py-4 sm:px-6 sm:py-6">
      <h1 className="mb-5 text-xl font-bold text-fg sm:text-2xl">Edit listing</h1>
      <Suspense fallback={<div className="skeleton h-[600px] rounded-xl" aria-hidden="true" />}>
        <EditForm params={params} />
      </Suspense>
    </div>
  );
}

async function EditForm({ params }: EditListingPageProps) {
  const { id } = await params;
  const user = await requireUser(editListingHref(id));
  const [listing, categories] = await Promise.all([getOwnListing(user.id, id), getCategories()]);
  if (!listing) notFound();
  return <ListingForm categories={categories} listing={listing} />;
}

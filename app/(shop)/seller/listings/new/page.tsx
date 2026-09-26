import { getCategories } from "@/lib/data/categories";
import { ListingForm } from "@/components/listings/ListingForm";

export const metadata = { title: "Sell an item - Shopeedo" };

// "Sell an item" (point 15). Categories are cached catalogue data; the form itself is client-side.
export default async function SellItemPage() {
  const categories = await getCategories();
  return (
    <div className="mx-auto max-w-[860px] px-3 py-4 sm:px-6 sm:py-6">
      <h1 className="text-xl font-bold text-fg sm:text-2xl">Sell an item</h1>
      <p className="mb-5 mt-1 text-sm text-fg-muted">Your listing goes live in search and on its own product page as soon as you publish it.</p>
      <ListingForm categories={categories} />
    </div>
  );
}

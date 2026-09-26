"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button, buttonClass } from "@/components/ui/Button";
import { Field, fieldClass } from "@/components/ui/Field";
import { StepCard } from "@/components/ui/StepCard";
import { PhotoPicker } from "@/components/listings/PhotoPicker";
import { usePhotoUploads } from "@/hooks/usePhotoUploads";
import { useListingForm } from "@/hooks/useListingForm";
import { LISTING_LIMITS } from "@/lib/constants/listings";
import { ROUTES } from "@/lib/constants/links";
import type { Category } from "@/lib/data/categories";
import type { OwnListing } from "@/lib/data/listings";

type ListingFormProps = {
  categories: Category[];
  /** The listing being edited; omitted for "Sell an item". */
  listing?: OwnListing;
};

const centsToInput = (cents: number | null | undefined) => (cents == null ? "" : (cents / 100).toFixed(2));

// "Sell an item" and "Edit listing" (point 15): photos first (they sell the item), then the
// details buyers search and read, then price and stock. Enter submits; the server validates it all
// again and publishes the listing straight into search and product pages.
export function ListingForm({ categories, listing }: ListingFormProps) {
  const uploads = usePhotoUploads(listing?.photos ?? []);
  const { errors, pending, handleSubmit, clearError } = useListingForm({ asin: listing?.asin, photos: uploads.photos, uploading: uploads.uploading });
  // Each feature row keeps a stable key, so removing one never shifts the typed text of the others.
  const [features, setFeatures] = useState(() => (listing?.features.length ? listing.features : [""]).map((value, id) => ({ id, value })));
  const nextId = useRef(features.length);

  return (
    <form onSubmit={handleSubmit} onInput={(event) => clearError((event.target as HTMLInputElement).name)} noValidate className="space-y-5">
      <StepCard idPrefix="listing-step" step={1} title="Photos" description="Clear photos on a plain background sell faster.">
        <PhotoPicker
          photos={uploads.photos}
          pending={uploads.pending}
          error={errors.photos}
          onAdd={(files) => {
            clearError("photos");
            uploads.addFiles(files);
          }}
          onRemove={uploads.remove}
          onMakeCover={uploads.makeCover}
        />
      </StepCard>

      <StepCard idPrefix="listing-step" step={2} title="Details" description="What buyers see in search and on the product page.">
        <Input label="Title" name="title" defaultValue={listing?.title} maxLength={LISTING_LIMITS.titleMax} error={errors.title} placeholder="e.g. Hand-thrown ceramic mug, 12 oz, sage green" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Brand (optional)" name="brand" defaultValue={listing?.brand} maxLength={LISTING_LIMITS.brandMax} error={errors.brand} placeholder="Your name is used if empty" />
          <Field label="Category" id="categorySlug" error={errors.categorySlug}>
            <select id="categorySlug" name="categorySlug" defaultValue={listing?.categorySlug ?? ""} aria-invalid={errors.categorySlug ? true : undefined} className={`${fieldClass} h-10`}>
              <option value="" disabled>
                Choose a category
              </option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Description" id="description" error={errors.description} className="mt-4">
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={listing?.description}
            maxLength={LISTING_LIMITS.descriptionMax}
            aria-invalid={errors.description ? true : undefined}
            placeholder="Condition, size, materials, what's in the box."
            className={`${fieldClass} py-2`}
          />
        </Field>
        <fieldset className="mt-4">
          <legend className="mb-1 text-sm font-semibold text-fg">Key features (optional)</legend>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={feature.id} className="flex gap-2 animate-[fade-in_200ms_ease-out]">
                <input
                  name="features"
                  aria-label={`Feature ${index + 1}`}
                  defaultValue={feature.value}
                  maxLength={LISTING_LIMITS.featureMax}
                  className={`${fieldClass} h-10`}
                  placeholder="e.g. Dishwasher safe"
                />
                {features.length > 1 && (
                  <Button variant="ghost" className="w-10 shrink-0 px-0 text-fg-muted" aria-label={`Remove feature ${index + 1}`} onClick={() => setFeatures((list) => list.filter((_, i) => i !== index))}>
                    <X size={18} aria-hidden="true" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {features.length < LISTING_LIMITS.featuresMax && (
            <Button variant="ghost" size="sm" className="mt-2 text-accent" onClick={() => setFeatures((list) => [...list, { id: nextId.current++, value: "" }])}>
              <Plus size={14} aria-hidden="true" />
              Add a feature
            </Button>
          )}
          {errors.features && <p className="mt-1 text-xs text-danger">{errors.features}</p>}
        </fieldset>
      </StepCard>

      <StepCard idPrefix="listing-step" step={3} title="Price and stock" description="Buyers pay Shopeedo's usual shipping and tax on top.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Price ($)" name="price" inputMode="decimal" defaultValue={centsToInput(listing?.priceCents)} error={errors.price} placeholder="e.g. 24.50" />
          <Input label={'"Was" price ($, optional)'} name="listPrice" inputMode="decimal" defaultValue={centsToInput(listing?.listPriceCents)} error={errors.listPrice} placeholder="Shows a discount" />
          <Input label="Stock" name="stock" inputMode="numeric" defaultValue={listing?.stock ?? 1} error={errors.stock} />
        </div>
      </StepCard>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" className="rounded-full" disabled={pending || uploads.uploading}>
          {pending ? "Saving..." : uploads.uploading ? "Uploading photos..." : listing ? "Save changes" : "Publish listing"}
        </Button>
        <Link href={ROUTES.sellerListings} className={buttonClass({ variant: "ghost", size: "lg", className: "rounded-full" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

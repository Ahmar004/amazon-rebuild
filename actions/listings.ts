"use server";

// Selling (frontend-rebuild.md point 15). The seller always comes from the session, and every
// write in lib/data/listings.ts is filtered by that seller's id, so nobody can change another
// seller's listing whatever id the client sends.
import { revalidateTag, updateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createListing, deleteListing, setListingStatus, updateListing } from "@/lib/data/listings";
import { deletePhotos } from "@/lib/listings/blob";
import { listingIdSchema, listingSchema, type ListingFormValues } from "@/lib/validation/listing";
import { publicName } from "@/lib/users/public-name";
import { fieldErrorsOf } from "@/lib/validation/auth";
import { LISTING_ERRORS, LISTING_STATUS } from "@/lib/constants/listings";

export type ListingResult = { ok: true } | { ok: false; error?: string; fieldErrors?: Record<string, string> };
export type SaveListingResult = { ok: true; asin: string } | { ok: false; error?: string; fieldErrors?: Record<string, string> };

const SIGNED_OUT = { ok: false, error: "Please sign in again." } as const;
const NOT_FOUND = { ok: false, error: LISTING_ERRORS.notFound } as const;
const GENERIC_ERROR = { ok: false, error: "We couldn't save that. Please try again." } as const;

// The seller sees the change at once on the product page and in search; rails that show the
// product catch up in the background.
function refreshStore(asin: string) {
  updateTag(`product:${asin}`);
  updateTag("search");
  revalidateTag("products", "max");
}

export async function saveListing(input: ListingFormValues & { asin?: string }): Promise<SaveListingResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;

  const { asin: editing, ...values } = input;
  if (editing !== undefined && !listingIdSchema.safeParse(editing).success) return NOT_FOUND;
  const parsed = listingSchema.safeParse(values);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };

  const sellerName = publicName(user.name);
  let result;
  let removedPhotos: string[] = [];
  try {
    if (editing) {
      const updated = await updateListing(user.id, sellerName, editing, parsed.data);
      if (updated.ok) removedPhotos = updated.removedPhotos;
      result = updated;
    } else {
      result = await createListing(user.id, sellerName, parsed.data);
    }
  } catch {
    return GENERIC_ERROR;
  }

  if (!result.ok) {
    return result.reason === "category" ? { ok: false, fieldErrors: { categorySlug: LISTING_ERRORS.categoryRequired } } : NOT_FOUND;
  }
  if (removedPhotos.length > 0) await deletePhotos(removedPhotos);
  refreshStore(result.asin);
  return { ok: true, asin: result.asin };
}

export async function setListingPaused(asin: string, paused: boolean): Promise<ListingResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  if (!listingIdSchema.safeParse(asin).success) return NOT_FOUND;

  const changed = await setListingStatus(user.id, asin, paused ? LISTING_STATUS.paused : LISTING_STATUS.active);
  if (!changed) return NOT_FOUND;
  refreshStore(asin);
  return { ok: true };
}

export async function removeListing(asin: string): Promise<ListingResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  if (!listingIdSchema.safeParse(asin).success) return NOT_FOUND;

  const result = await deleteListing(user.id, asin);
  if (!result.deleted) return NOT_FOUND;
  if (result.hardDeleted) await deletePhotos(result.photos);
  refreshStore(asin);
  return { ok: true };
}

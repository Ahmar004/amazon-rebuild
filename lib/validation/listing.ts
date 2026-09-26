// Input schema for actions/listings.ts. Client code imports the limits from lib/constants/listings.ts.
import { z } from "zod";
import { LISTING_ERRORS, LISTING_ID_PREFIX, LISTING_LIMITS } from "@/lib/constants/listings";
import { isListingPhotoUrl } from "@/lib/listings/photos";
import { parsePriceToCents } from "@/lib/pricing/money";

const L = LISTING_LIMITS;

function price(field: z.RefinementCtx, raw: string): number {
  const cents = parsePriceToCents(raw);
  if (cents === null) {
    field.addIssue({ code: "custom", message: LISTING_ERRORS.priceInvalid });
    return z.NEVER;
  }
  if (cents < L.priceMinCents || cents > L.priceMaxCents) {
    field.addIssue({ code: "custom", message: LISTING_ERRORS.priceOutOfRange });
    return z.NEVER;
  }
  return cents;
}

export const listingSchema = z
  .object({
    title: z.string().trim().min(L.titleMin, LISTING_ERRORS.titleTooShort).max(L.titleMax, LISTING_ERRORS.titleTooLong),
    brand: z
      .string()
      .trim()
      .max(L.brandMax, LISTING_ERRORS.brandTooLong)
      .transform((v) => v || null),
    categorySlug: z.string().trim().regex(/^[a-z0-9-]+$/, LISTING_ERRORS.categoryRequired),
    price: z.string().transform((raw, ctx) => price(ctx, raw)),
    listPrice: z
      .string()
      .optional()
      .transform((raw, ctx) => (raw?.trim() ? price(ctx, raw) : null)),
    stock: z.coerce
      .string()
      .trim()
      .regex(/^\d+$/, LISTING_ERRORS.stockInvalid)
      .transform(Number)
      .pipe(z.number().max(L.stockMax, LISTING_ERRORS.stockInvalid)),
    description: z
      .string()
      .trim()
      .min(L.descriptionMin, LISTING_ERRORS.descriptionTooShort)
      .max(L.descriptionMax, LISTING_ERRORS.descriptionTooLong),
    features: z
      .array(z.string().trim().max(L.featureMax, LISTING_ERRORS.featureTooLong))
      .transform((list) => list.filter(Boolean))
      .pipe(z.array(z.string()).max(L.featuresMax, LISTING_ERRORS.featuresTooMany)),
    photos: z
      .array(z.string().refine(isListingPhotoUrl, LISTING_ERRORS.photoInvalid))
      .min(L.photosMin, LISTING_ERRORS.photosRequired)
      .max(L.photosMax, LISTING_ERRORS.photosTooMany),
  })
  .superRefine((value, ctx) => {
    if (value.listPrice !== null && value.listPrice <= value.price) {
      ctx.addIssue({ code: "custom", path: ["listPrice"], message: LISTING_ERRORS.listPriceTooLow });
    }
  })
  .transform(({ price: priceCents, listPrice: listPriceCents, ...rest }) => ({
    title: rest.title,
    brand: rest.brand,
    categorySlug: rest.categorySlug,
    priceCents,
    listPriceCents,
    stock: rest.stock,
    description: rest.description,
    features: rest.features,
    photos: rest.photos,
  }));

export type ListingInput = z.output<typeof listingSchema>;
export type ListingFormValues = z.input<typeof listingSchema>;

/** A listing's product id: the listing prefix plus nine letters or digits. */
export const listingIdSchema = z.string().regex(new RegExp(`^${LISTING_ID_PREFIX}[0-9A-Z]{9}$`));

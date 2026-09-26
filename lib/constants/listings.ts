// Selling vocabulary and limits (frontend-rebuild.md point 15, D2). Safe for client code: no
// database imports, so the listing form reads its limits from here.

// Must list the same values as listingStatusEnum in lib/db/schema.ts.
export const LISTING_STATUS = { active: "active", paused: "paused", removed: "removed" } as const;
export type ListingStatus = (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS];

export const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  active: "Active",
  paused: "Paused",
  removed: "Removed",
};

/** Product ids of user listings start with this letter; catalogue ids never do. */
export const LISTING_ID_PREFIX = "L";

export const LISTING_LIMITS = {
  titleMin: 5,
  titleMax: 200,
  brandMax: 60,
  descriptionMin: 20,
  descriptionMax: 5000,
  featuresMax: 5,
  featureMax: 200,
  priceMinCents: 50,
  priceMaxCents: 10_000_000,
  stockMax: 9999,
  photosMin: 1,
  photosMax: 5,
  photoMaxBytes: 4 * 1024 * 1024,
} as const;

export const LISTING_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Photos are stored in the public Vercel Blob store under this folder. */
export const LISTING_PHOTO_FOLDER = "listings";
/** Every public Vercel Blob URL is served from a subdomain of this host. */
export const LISTING_PHOTO_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export const LISTING_ERRORS = {
  titleTooShort: `Give the item a title of at least ${LISTING_LIMITS.titleMin} characters`,
  titleTooLong: `Keep the title under ${LISTING_LIMITS.titleMax} characters`,
  brandTooLong: `Keep the brand under ${LISTING_LIMITS.brandMax} characters`,
  categoryRequired: "Choose a category",
  priceInvalid: "Enter a price such as 19.99",
  priceOutOfRange: `Price must be between $${LISTING_LIMITS.priceMinCents / 100} and $${(LISTING_LIMITS.priceMaxCents / 100).toLocaleString("en-US")}`,
  listPriceTooLow: "The \"was\" price must be higher than the price",
  stockInvalid: `Stock must be a whole number from 0 to ${LISTING_LIMITS.stockMax}`,
  descriptionTooShort: `Describe the item in at least ${LISTING_LIMITS.descriptionMin} characters`,
  descriptionTooLong: `Keep the description under ${LISTING_LIMITS.descriptionMax} characters`,
  featuresTooMany: `Add at most ${LISTING_LIMITS.featuresMax} key features`,
  featureTooLong: `Keep each feature under ${LISTING_LIMITS.featureMax} characters`,
  photosRequired: "Add at least one photo",
  photosTooMany: `Add at most ${LISTING_LIMITS.photosMax} photos`,
  photoInvalid: "One of the photos didn't upload. Remove it and try again",
  photoType: "Photos must be JPEG, PNG or WebP images",
  photoTooBig: `Each photo must be under ${LISTING_LIMITS.photoMaxBytes / (1024 * 1024)} MB`,
  notFound: "That listing isn't on your account",
} as const;

/** The route that hands the browser a Blob upload token (app/api/listing-photos/route.ts). */
export const LISTING_PHOTO_UPLOAD_URL = "/api/listing-photos";

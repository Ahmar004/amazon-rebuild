import { describe, expect, it } from "vitest";
import { listingSchema } from "@/lib/validation/listing";
import { LISTING_ERRORS } from "@/lib/constants/listings";
import { fieldErrorsOf } from "@/lib/validation/auth";

const PHOTO = "https://abc123.public.blob.vercel-storage.com/listings/mug-x7Yz.jpg";

const valid = {
  title: "Hand-thrown ceramic mug",
  brand: "",
  categorySlug: "home-kitchen",
  price: "24.50",
  listPrice: "",
  stock: "12",
  description: "A 12 oz stoneware mug, glazed by hand and safe for the dishwasher.",
  features: ["12 oz", "  ", "Dishwasher safe"],
  photos: [PHOTO],
};

function errorsOf(input: unknown) {
  const parsed = listingSchema.safeParse(input);
  return parsed.success ? {} : fieldErrorsOf(parsed.error);
}

describe("listingSchema", () => {
  it("parses a valid listing into cents and drops blank features", () => {
    expect(listingSchema.parse(valid)).toEqual({
      title: "Hand-thrown ceramic mug",
      brand: null,
      categorySlug: "home-kitchen",
      priceCents: 2450,
      listPriceCents: null,
      stock: 12,
      description: valid.description,
      features: ["12 oz", "Dishwasher safe"],
      photos: [PHOTO],
    });
  });

  it("keeps a was price above the price", () => {
    expect(listingSchema.parse({ ...valid, listPrice: "30" }).listPriceCents).toBe(3000);
    expect(errorsOf({ ...valid, listPrice: "20" })).toMatchObject({ listPrice: LISTING_ERRORS.listPriceTooLow });
  });

  it("reports each invalid field", () => {
    expect(
      errorsOf({ ...valid, title: "Mug", categorySlug: "", price: "abc", stock: "1.5", description: "short", photos: [] }),
    ).toMatchObject({
      title: LISTING_ERRORS.titleTooShort,
      categorySlug: LISTING_ERRORS.categoryRequired,
      price: LISTING_ERRORS.priceInvalid,
      stock: LISTING_ERRORS.stockInvalid,
      description: LISTING_ERRORS.descriptionTooShort,
      photos: LISTING_ERRORS.photosRequired,
    });
  });

  it("rejects prices out of range and too many photos or features", () => {
    expect(errorsOf({ ...valid, price: "0.10" })).toMatchObject({ price: LISTING_ERRORS.priceOutOfRange });
    expect(errorsOf({ ...valid, photos: Array(6).fill(PHOTO) })).toMatchObject({ photos: LISTING_ERRORS.photosTooMany });
    expect(errorsOf({ ...valid, features: ["a", "b", "c", "d", "e", "f"] })).toMatchObject({ features: LISTING_ERRORS.featuresTooMany });
  });

  it("only accepts photos uploaded to the listing photo store", () => {
    expect(errorsOf({ ...valid, photos: ["https://example.com/listings/a.jpg"] })).toMatchObject({ photos: LISTING_ERRORS.photoInvalid });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { LISTING_ERRORS } from "@/lib/constants/listings";

const user = { id: "11111111-1111-4111-8111-111111111111", name: "Ada Lovelace" };
const PHOTO = "https://abc123.public.blob.vercel-storage.com/listings/mug-x7Yz.jpg";
const OLD_PHOTO = "https://abc123.public.blob.vercel-storage.com/listings/old-a1B2.jpg";
const currentUser = vi.fn(async (): Promise<typeof user | null> => user);
const data = {
  createListing: vi.fn(async () => ({ ok: true, asin: "LABC123456" })),
  updateListing: vi.fn(async () => ({ ok: true, asin: "LABC123456", removedPhotos: [OLD_PHOTO] })),
  setListingStatus: vi.fn(async () => true),
  deleteListing: vi.fn(async () => ({ deleted: true, hardDeleted: true, photos: [PHOTO] })),
};
const deletePhotos = vi.fn(async () => {});
const updateTag = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: currentUser }));
vi.mock("@/lib/data/listings", () => data);
vi.mock("@/lib/listings/blob", () => ({ deletePhotos }));
vi.mock("next/cache", () => ({ updateTag, revalidateTag: vi.fn() }));

const { saveListing, setListingPaused, removeListing } = await import("@/actions/listings");

const form = {
  title: "Hand-thrown ceramic mug",
  brand: "",
  categorySlug: "home-kitchen",
  price: "24.50",
  listPrice: "",
  stock: "12",
  description: "A 12 oz stoneware mug, glazed by hand and safe for the dishwasher.",
  features: ["12 oz"],
  photos: [PHOTO],
};

describe("saveListing", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a listing for the signed-in seller", async () => {
    expect(await saveListing(form)).toEqual({ ok: true, asin: "LABC123456" });
    expect(data.createListing).toHaveBeenCalledWith(user.id, "Ada L.", expect.objectContaining({ priceCents: 2450, stock: 12 }));
    expect(updateTag).toHaveBeenCalledWith("search");
  });

  it("updates the seller's listing and deletes the photos it dropped", async () => {
    expect(await saveListing({ ...form, asin: "LABC123456" })).toEqual({ ok: true, asin: "LABC123456" });
    expect(data.updateListing).toHaveBeenCalledWith(user.id, "Ada L.", "LABC123456", expect.any(Object));
    expect(deletePhotos).toHaveBeenCalledWith([OLD_PHOTO]);
    expect(updateTag).toHaveBeenCalledWith("product:LABC123456");
  });

  it("refuses to edit a listing that isn't the seller's", async () => {
    data.updateListing.mockResolvedValueOnce({ ok: false, reason: "not_found" } as never);
    expect(await saveListing({ ...form, asin: "LOTHER0000" })).toEqual({ ok: false, error: LISTING_ERRORS.notFound });
  });

  it("reports an unknown category on the field", async () => {
    data.createListing.mockResolvedValueOnce({ ok: false, reason: "category" } as never);
    expect(await saveListing(form)).toEqual({ ok: false, fieldErrors: { categorySlug: LISTING_ERRORS.categoryRequired } });
  });

  it("returns field errors without touching the database", async () => {
    const result = await saveListing({ ...form, title: "Mug", photos: [] });
    expect(result).toMatchObject({ ok: false, fieldErrors: { title: LISTING_ERRORS.titleTooShort, photos: LISTING_ERRORS.photosRequired } });
    expect(data.createListing).not.toHaveBeenCalled();
  });

  it("refuses when signed out", async () => {
    currentUser.mockResolvedValueOnce(null);
    expect((await saveListing(form)).ok).toBe(false);
    expect(data.createListing).not.toHaveBeenCalled();
  });
});

describe("setListingPaused", () => {
  beforeEach(() => vi.clearAllMocks());

  it("pauses and resumes the seller's own listing", async () => {
    expect(await setListingPaused("LABC123456", true)).toEqual({ ok: true });
    expect(data.setListingStatus).toHaveBeenCalledWith(user.id, "LABC123456", "paused");
    await setListingPaused("LABC123456", false);
    expect(data.setListingStatus).toHaveBeenLastCalledWith(user.id, "LABC123456", "active");
  });

  it("reports a listing that isn't the seller's", async () => {
    data.setListingStatus.mockResolvedValueOnce(false);
    expect(await setListingPaused("LOTHER0000", true)).toEqual({ ok: false, error: LISTING_ERRORS.notFound });
  });

  it("rejects a malformed id", async () => {
    expect((await setListingPaused("'; drop", true)).ok).toBe(false);
    expect(data.setListingStatus).not.toHaveBeenCalled();
  });
});

describe("removeListing", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes the listing and its photos", async () => {
    expect(await removeListing("LABC123456")).toEqual({ ok: true });
    expect(data.deleteListing).toHaveBeenCalledWith(user.id, "LABC123456");
    expect(deletePhotos).toHaveBeenCalledWith([PHOTO]);
  });

  it("reports a listing that isn't the seller's", async () => {
    data.deleteListing.mockResolvedValueOnce({ deleted: false } as never);
    expect(await removeListing("LOTHER0000")).toEqual({ ok: false, error: LISTING_ERRORS.notFound });
    expect(deletePhotos).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from "vitest";
import { isListingPhotoUrl, listingImages } from "@/lib/listings/photos";
import { imageAt } from "@/lib/assets";

const PHOTO = "https://abc123.public.blob.vercel-storage.com/listings/mug-x7Yz.jpg";

describe("isListingPhotoUrl", () => {
  it("accepts a public Blob URL in the listings folder", () => {
    expect(isListingPhotoUrl(PHOTO)).toBe(true);
  });

  it("rejects other hosts, plain http and other folders", () => {
    expect(isListingPhotoUrl("https://example.com/listings/mug.jpg")).toBe(false);
    expect(isListingPhotoUrl("http://abc123.public.blob.vercel-storage.com/listings/mug.jpg")).toBe(false);
    expect(isListingPhotoUrl("https://abc123.public.blob.vercel-storage.com/other/mug.jpg")).toBe(false);
    expect(isListingPhotoUrl("https://evil.com/.public.blob.vercel-storage.com/listings/a.jpg")).toBe(false);
    expect(isListingPhotoUrl("not a url")).toBe(false);
  });
});

describe("listingImages", () => {
  it("uses the uploaded photo at every size", () => {
    expect(listingImages([PHOTO])).toEqual([{ thumb: PHOTO, large: PHOTO, hiRes: PHOTO }]);
  });
});

describe("imageAt", () => {
  it("leaves an uploaded listing photo unchanged", () => {
    expect(imageAt(PHOTO, "UL320")).toBe(PHOTO);
  });
});

describe("photoUploadRules", () => {
  it("allows images under the size cap in the listings folder only", async () => {
    const { photoUploadRules } = await import("@/lib/listings/photos");
    expect(photoUploadRules("listings/mug.jpg")).toEqual({
      allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
      maximumSizeInBytes: 4 * 1024 * 1024,
      addRandomSuffix: true,
    });
    expect(photoUploadRules("other/mug.jpg")).toBeNull();
    expect(photoUploadRules("listings/../secrets.txt")).toBeNull();
    expect(photoUploadRules("listings/sub/mug.jpg")).toBeNull();
  });
});

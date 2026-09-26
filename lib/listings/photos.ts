// Listing photos (frontend-rebuild.md D2) are uploaded from the browser to the public Vercel Blob
// store. The server only saves URLs that point into that store's listings folder, so a listing can
// never embed an image from another site.
import type { ProductImage } from "@/lib/db/schema";
import { LISTING_LIMITS, LISTING_PHOTO_FOLDER, LISTING_PHOTO_HOST_SUFFIX, LISTING_PHOTO_TYPES } from "@/lib/constants/listings";

export function isListingPhotoUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === "https:" && url.hostname.endsWith(LISTING_PHOTO_HOST_SUFFIX) && url.pathname.startsWith(`/${LISTING_PHOTO_FOLDER}/`);
}

// Uploaded photos have one size, so every slot of the catalogue's image shape points at it.
export function listingImages(urls: string[]): ProductImage[] {
  return urls.map((url) => ({ thumb: url, large: url, hiRes: url }));
}

// What the upload route lets a signed-in seller upload: one image file, straight into the
// listings folder, under the size cap, with a random suffix so names never collide.
export function photoUploadRules(pathname: string) {
  const [folder, name, ...rest] = pathname.split("/");
  if (folder !== LISTING_PHOTO_FOLDER || !name || rest.length > 0 || !/^[A-Za-z0-9_-][A-Za-z0-9_.-]*$/.test(name) || name.includes("..")) return null;
  return {
    allowedContentTypes: [...LISTING_PHOTO_TYPES],
    maximumSizeInBytes: LISTING_LIMITS.photoMaxBytes,
    addRandomSuffix: true,
  };
}

// Deletes listing photos from the Vercel Blob store once no listing uses them. Best effort: a
// failed delete only leaves an unused file behind, so it never fails the seller's action.
import { del } from "@vercel/blob";
import { isListingPhotoUrl } from "@/lib/listings/photos";

export async function deletePhotos(urls: string[]): Promise<void> {
  const photos = urls.filter(isListingPhotoUrl);
  if (photos.length === 0 || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(photos);
  } catch (error) {
    console.error("Could not delete listing photos", error);
  }
}

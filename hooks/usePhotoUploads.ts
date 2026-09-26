"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useToast } from "@/components/ui/Toast";
import { LISTING_ERRORS, LISTING_LIMITS, LISTING_PHOTO_FOLDER, LISTING_PHOTO_TYPES, LISTING_PHOTO_UPLOAD_URL } from "@/lib/constants/listings";

export type PendingPhoto = { key: string; preview: string; progress: number };

function blobPath(file: File): string {
  const name = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^[-.]+/, "").slice(-60) || "photo";
  return `${LISTING_PHOTO_FOLDER}/${name}`;
}

// Listing photos (D2): each picked file uploads straight from the browser to the Blob store, with
// a local preview and progress while it goes. The first photo is the cover.
export function usePhotoUploads(initial: string[]) {
  const [photos, setPhotos] = useState<string[]>(initial);
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const toast = useToast();
  const previews = useRef(new Set<string>());

  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function addFiles(files: FileList | File[]) {
    const room = LISTING_LIMITS.photosMax - photos.length - pending.length;
    const picked = Array.from(files);
    if (picked.length > room) toast(LISTING_ERRORS.photosTooMany, "error");

    for (const file of picked.slice(0, Math.max(0, room))) {
      if (!(LISTING_PHOTO_TYPES as readonly string[]).includes(file.type)) {
        toast(LISTING_ERRORS.photoType, "error");
        continue;
      }
      if (file.size > LISTING_LIMITS.photoMaxBytes) {
        toast(LISTING_ERRORS.photoTooBig, "error");
        continue;
      }
      const key = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      setPending((list) => [...list, { key, preview, progress: 0 }]);

      upload(blobPath(file), file, {
        access: "public",
        handleUploadUrl: LISTING_PHOTO_UPLOAD_URL,
        contentType: file.type,
        onUploadProgress: ({ percentage }) =>
          setPending((list) => list.map((p) => (p.key === key ? { ...p, progress: percentage } : p))),
      })
        .then((blob) => setPhotos((list) => [...list, blob.url]))
        .catch(() => toast("A photo didn't upload. Please try again.", "error"))
        .finally(() => {
          setPending((list) => list.filter((p) => p.key !== key));
          URL.revokeObjectURL(preview);
          previews.current.delete(preview);
        });
    }
  }

  function remove(url: string) {
    setPhotos((list) => list.filter((p) => p !== url));
  }

  function makeCover(url: string) {
    setPhotos((list) => [url, ...list.filter((p) => p !== url)]);
  }

  return { photos, pending, uploading: pending.length > 0, addFiles, remove, makeCover };
}

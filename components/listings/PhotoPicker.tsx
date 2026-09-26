"use client";

import { useRef, useState, type DragEvent } from "react";
import { ImagePlus, Star, X } from "lucide-react";
import { LISTING_LIMITS, LISTING_PHOTO_TYPES } from "@/lib/constants/listings";
import type { PendingPhoto } from "@/hooks/usePhotoUploads";

type PhotoPickerProps = {
  photos: string[];
  pending: PendingPhoto[];
  error?: string;
  onAdd: (files: FileList) => void;
  onRemove: (url: string) => void;
  onMakeCover: (url: string) => void;
};

// 1-5 listing photos (D2): a drop zone that also opens the file picker, uploaded thumbnails with
// "Make cover" and "Remove", and in-progress uploads with their progress.
export function PhotoPicker({ photos, pending, error, onAdd, onRemove, onMakeCover }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const full = photos.length + pending.length >= LISTING_LIMITS.photosMax;

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) onAdd(event.dataTransfer.files);
  }

  return (
    <div>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5" aria-label="Listing photos">
        {photos.map((url, index) => (
          <li key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-white animate-[fade-in_200ms_ease-out]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Photo ${index + 1}`} className="h-full w-full object-contain" />
            {index === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-fg">Cover</span>}
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1">
              {index > 0 && (
                <button type="button" onClick={() => onMakeCover(url)} aria-label={`Make photo ${index + 1} the cover`} className="flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-fg shadow-card hover:bg-surface">
                  <Star size={14} aria-hidden="true" />
                </button>
              )}
              <button type="button" onClick={() => onRemove(url)} aria-label={`Remove photo ${index + 1}`} className="flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-fg shadow-card hover:bg-surface">
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
        {pending.map((photo) => (
          <li key={photo.key} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.preview} alt="" className="h-full w-full object-contain opacity-50" />
            <div className="absolute inset-x-2 bottom-2 h-1.5 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-label="Uploading photo" aria-valuenow={Math.round(photo.progress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-accent transition-[width]" style={{ width: `${photo.progress}%` }} />
            </div>
          </li>
        ))}
        {!full && (
          <li className="aspect-square">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              aria-describedby="photos-hint"
              className={`flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-sm text-fg-muted transition-colors hover:border-accent hover:text-accent ${dragging ? "border-accent bg-accent-soft text-accent" : "border-border-strong"}`}
            >
              <ImagePlus size={22} aria-hidden="true" />
              Add photos
            </button>
          </li>
        )}
      </ul>
      <input
        ref={inputRef}
        type="file"
        accept={LISTING_PHOTO_TYPES.join(",")}
        multiple
        hidden
        onChange={(event) => {
          if (event.target.files) onAdd(event.target.files);
          event.target.value = "";
        }}
      />
      <p id="photos-hint" className="mt-2 text-xs text-fg-muted">
        Up to {LISTING_LIMITS.photosMax} photos, JPEG, PNG or WebP, {LISTING_LIMITS.photoMaxBytes / (1024 * 1024)} MB each. The first one is the cover.
      </p>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

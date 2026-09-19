"use client";

import { useRef, useState, type MouseEvent } from "react";
import { imageAt } from "@/lib/assets";
import { ImageViewer } from "@/components/product/ImageViewer";
import { ShareButton } from "@/components/product/ShareButton";
import type { ProductImage } from "@/lib/data/products";

type GalleryProps = {
  images: ProductImage[];
  title: string;
};

// Desktop: a vertical thumbnail strip, the main image, a hover zoom lens rendered as a panel to
// the right (over the centre column), and "Click to see full view" opening ImageViewer.
// Mobile (below 768px, docs/spec.md 5.13): the thumbnail strip and zoom lens are hidden in favour
// of a swipeable image carousel with dot indicators - no zoom lens on touch devices.
export function Gallery({ images, title }: GalleryProps) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center bg-tile-bg text-sm text-text-muted">
        No image available
      </div>
    );
  }

  const current = images[selected];
  const mainSrc = current.hiRes ?? current.large;

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoom({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="hidden flex-col gap-2 md:flex">
          {images.map((image, i) => (
            <button
              key={`${image.thumb}-${i}`}
              type="button"
              onMouseEnter={() => setSelected(i)}
              onFocus={() => setSelected(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === selected}
              className={`h-10 w-10 shrink-0 overflow-hidden border ${
                i === selected ? "border-2 border-link-hover" : "border-border"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageAt(image.thumb, "SX40")} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex justify-end">
            <ShareButton />
          </div>

          <div
            ref={imageRef}
            className="relative flex h-[500px] w-full items-center justify-center md:cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoom(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageAt(mainSrc, "SX500")}
              alt={title}
              className="max-h-[500px] max-w-full object-contain"
            />

            {zoom && (
              <div
                className="pointer-events-none absolute left-full top-0 z-40 hidden h-[500px] w-[500px] shrink-0 border border-border bg-white shadow-lg md:block"
                style={{
                  backgroundImage: `url(${imageAt(mainSrc, "SX1500")})`,
                  backgroundSize: "200% 200%",
                  backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                  backgroundRepeat: "no-repeat",
                }}
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => setViewerOpen(true)}
            className="mt-2 block w-full text-center text-sm text-link hover:text-link-hover hover:underline"
          >
            Click to see full view
          </button>
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5 md:hidden">
          {images.map((image, i) => (
            <button
              key={`dot-${image.thumb}-${i}`}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === selected}
              className={`h-1.5 w-1.5 rounded-full ${i === selected ? "bg-link-hover" : "bg-border"}`}
            />
          ))}
        </div>
      )}

      <ImageViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={images}
        title={title}
        initialIndex={selected}
      />
    </div>
  );
}

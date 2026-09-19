"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { imageAt } from "@/lib/assets";
import type { ProductImage } from "@/lib/data/products";

type ImageViewerProps = {
  open: boolean;
  onClose: () => void;
  images: ProductImage[];
  title: string;
  initialIndex: number;
};

// "Click to see full view" modal: the large image plus a thumbnail row to switch it
// (docs/spec.md 5.5). Built on the shared Modal, widened via its widthClassName prop.
export function ImageViewer({ open, onClose, images, title, initialIndex }: ImageViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  // Resets the shown image whenever the modal (re)opens, without an effect: adjusting state
  // during render in response to a prop change is React's recommended alternative to
  // useEffect + setState (https://react.dev/learn/you-might-not-need-an-effect).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setIndex(initialIndex);
  }

  if (images.length === 0) return null;
  const current = images[Math.min(index, images.length - 1)];
  const src = current.hiRes ?? current.large;

  return (
    <Modal open={open} onClose={onClose} title={title} labelledBy="image-viewer-title" widthClassName="max-w-3xl">
      <div className="flex flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageAt(src, "SX1500")} alt={title} className="max-h-[60vh] w-full object-contain" />
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, i) => (
            <button
              key={`${image.thumb}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Image ${i + 1}`}
              className={`h-12 w-12 shrink-0 overflow-hidden border ${
                i === index ? "border-2 border-link-hover" : "border-border"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageAt(image.thumb, "SX48")} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

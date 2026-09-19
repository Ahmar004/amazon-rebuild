"use client";

import { useEffect, useState } from "react";
import { imageAt } from "@/lib/assets";

type StickyProductNavProps = {
  /** id of the element to watch; the nav shows once the page scrolls past it (the buy box). */
  sentinelId: string;
  title: string;
  imageUrl: string;
};

const SECTIONS = [
  { id: "about-this-item", label: "About this item" },
  { id: "similar", label: "Similar" },
  { id: "product-information", label: "Product information" },
  { id: "reviews", label: "Reviews" },
] as const;

// The slim white bar that pins under the header once the page scrolls past the buy box
// (docs/spec.md 5.5), driven by an IntersectionObserver on that sentinel (docs/design.md 6.4).
// Desktop only - no sticky nav on mobile (plan).
export function StickyProductNav({ sentinelId, title, imageUrl }: StickyProductNavProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

  if (!visible) return null;

  return (
    <div className="sticky top-0 z-30 hidden border-b border-border bg-white md:block">
      <nav className="mx-auto flex max-w-[1500px] items-center gap-6 px-4 py-2 text-sm text-text">
        <a href="#top" className="flex items-center gap-1 text-link hover:text-link-hover">
          <ArrowUpIcon />
          Top
        </a>
        {SECTIONS.map((section) => (
          <a key={section.id} href={`#${section.id}`} className="text-link hover:text-link-hover">
            {section.label}
          </a>
        ))}

        <span className="ml-auto flex items-center gap-2">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageAt(imageUrl, "SX40")} alt="" className="h-10 w-10 object-contain" />
          )}
          <span className="max-w-[240px] truncate font-bold">{title}</span>
        </span>
      </nav>
    </div>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M5 9 V1 M1 5 L5 1 L9 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

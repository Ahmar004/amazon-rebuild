"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CaretDown } from "@/components/layout/CaretDown";
import type { HeroSlide } from "@/lib/content/home";

const AUTO_ADVANCE_MS = 5000;

type HeroCarouselProps = {
  slides: HeroSlide[];
};

// Desktop hero: full-width image at a 3000:1200 crop, auto-advances every 5s, pauses on
// hover/focus, and responds to the arrow keys (docs/superpowers/plans/2026-09-19-slice-2-home.md
// task 1). Client component because it owns interval/keyboard state; the page and its data stay
// server-rendered and cached.
export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  const containerRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  }

  const slide = slides[index];

  return (
    <div
      ref={containerRef}
      className="relative aspect-[5/2] w-full overflow-hidden bg-page-bg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={handleKeyDown}
    >
      <Link href={slide.href} className="absolute inset-0 block">
        {/* eslint-disable-next-line @next/next/no-img-element -- Amazon CDN creative, not optimised by Vercel (CLAUDE.md). */}
        <img
          src={slide.image}
          alt={slide.alt}
          className="h-full w-full object-cover object-top"
        />
      </Link>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => goTo(index - 1)}
        className="absolute left-0 top-0 flex h-full w-20 items-center justify-center bg-transparent hover:bg-black/10 focus:outline focus:outline-2 focus:outline-white"
      >
        <CaretDown className="h-6 w-6 rotate-90 text-white" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => goTo(index + 1)}
        className="absolute right-0 top-0 flex h-full w-20 items-center justify-center bg-transparent hover:bg-black/10 focus:outline focus:outline-2 focus:outline-white"
      >
        <CaretDown className="h-6 w-6 -rotate-90 text-white" />
      </button>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[150px] bg-gradient-to-b from-transparent to-page-bg"
      />
    </div>
  );
}

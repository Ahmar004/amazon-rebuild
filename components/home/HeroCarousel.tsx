"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { clickZone, wrapIndex } from "@/lib/home/hero";
import { imageAt } from "@/lib/assets";
import { HERO_AUTOPLAY_MS, type HeroTone } from "@/lib/constants/home";
import type { HeroSlide } from "@/lib/data/home";

const TONES: Record<HeroTone, string> = {
  teal: "from-hero-teal-from to-hero-teal-to",
  indigo: "from-hero-indigo-from to-hero-indigo-to",
  ember: "from-hero-ember-from to-hero-ember-to",
  plum: "from-hero-plum-from to-hero-plum-to",
  ocean: "from-hero-ocean-from to-hero-ocean-to",
};

const SWIPE_PX = 50;

// The home hero (frontend-rebuild.md points 5 and 8). Clicking the left quarter of the banner
// goes back, the right quarter goes forward, and the middle opens the slide's page; there is no
// grey arrow strip on hover. It autoplays, pauses on hover or focus, and swipes on touch. The
// active dot's progress bar drives autoplay (its animationend advances the slide), so pausing the
// bar pauses the timer too.
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const swipe = useRef<{ x: number; moved: boolean } | null>(null);

  const count = slides.length;
  if (count === 0) return null;
  const go = (next: number) => setIndex(wrapIndex(next, count));
  const autoplay = !reducedMotion && !stopped && count > 1;

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (swipe.current?.moved) return;
    if ((event.target as HTMLElement).closest("a, button")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const zone = clickZone(event.clientX - rect.left, rect.width);
    if (zone === "prev") go(index - 1);
    else if (zone === "next") go(index + 1);
    else router.push(slides[index].href);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.dataset.zone = clickZone(event.clientX - rect.left, rect.width);
    if (swipe.current && Math.abs(event.clientX - swipe.current.x) > SWIPE_PX / 2) swipe.current.moved = true;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = swipe.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? index + 1 : index - 1);
    // Keep "moved" until the click that follows this pointerup has been ignored.
    setTimeout(() => (swipe.current = null), 0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") go(index - 1);
    if (event.key === "ArrowRight") go(index + 1);
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="relative overflow-hidden rounded-2xl shadow-card"
    >
      <div
        onClick={handleClick}
        onPointerDown={(e) => (swipe.current = { x: e.clientX, moved: false })}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative h-[300px] touch-pan-y select-none data-[zone=next]:cursor-e-resize data-[zone=none]:cursor-pointer data-[zone=prev]:cursor-w-resize sm:h-[340px] lg:h-[380px]"
      >
        {slides.map((slide, i) => (
          <Slide key={slide.key} slide={slide} active={i === index} position={i + 1} total={count} />
        ))}
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-hero-fg backdrop-blur-sm sm:bottom-4 sm:right-4">
        <HeroButton label="Previous slide" onClick={() => go(index - 1)}>
          <ChevronLeft size={16} aria-hidden="true" />
        </HeroButton>
        {slides.map((slide, i) => (
          <button
            key={slide.key}
            type="button"
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}: ${slide.eyebrow}`}
            aria-current={i === index}
            className={`relative h-1.5 overflow-hidden rounded-full bg-white/35 transition-all duration-300 ${i === index ? "w-8" : "w-3 hover:bg-white/60"}`}
          >
            {i === index && (
              <span
                key={index}
                onAnimationEnd={() => go(index + 1)}
                className="absolute inset-0 origin-left rounded-full bg-white"
                style={
                  autoplay
                    ? { animation: `progress ${HERO_AUTOPLAY_MS}ms linear`, animationPlayState: hovered ? "paused" : "running" }
                    : undefined
                }
              />
            )}
          </button>
        ))}
        <HeroButton label="Next slide" onClick={() => go(index + 1)}>
          <ChevronRight size={16} aria-hidden="true" />
        </HeroButton>
        {!reducedMotion && count > 1 && (
          <HeroButton label={stopped ? "Play slideshow" : "Pause slideshow"} onClick={() => setStopped((v) => !v)}>
            {stopped ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          </HeroButton>
        )}
      </div>
    </section>
  );
}

function Slide({ slide, active, position, total }: { slide: HeroSlide; active: boolean; position: number; total: number }) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${position} of ${total}`}
      aria-hidden={!active}
      inert={!active}
      className={`absolute inset-0 flex items-center bg-linear-to-br ${TONES[slide.tone]} text-hero-fg transition-all duration-700 ease-out ${
        active ? "visible opacity-100" : "invisible scale-[1.03] opacity-0"
      }`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-black/10 blur-2xl" />

      <div className="relative z-10 flex w-full items-center gap-6 px-6 sm:px-10 lg:px-14">
        <div className={`max-w-md ${active ? "animate-[rise-in_700ms_ease-out_both]" : ""}`}>
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            {slide.eyebrow}
          </span>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-4xl">{slide.headline}</h2>
          <p className="mt-2 text-sm text-white/85 sm:text-base">{slide.subline}</p>
          <Link
            href={slide.href}
            tabIndex={active ? 0 : -1}
            className="group/cta mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-inverse shadow-pop transition hover:gap-3"
          >
            {slide.cta}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="relative ml-auto hidden h-[260px] w-[420px] shrink-0 md:block lg:w-[520px]">
          {slide.images.map((src, i) => (
            <div
              key={src}
              className={`absolute flex items-center justify-center rounded-2xl bg-white p-3 shadow-pop ${PHOTO_SLOTS[i] ?? ""} ${
                active ? "animate-[rise-in_800ms_ease-out_both]" : ""
              }`}
              style={{ animationDelay: `${150 + i * 120}ms` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- dataset image, pre-sized by URL */}
              <img
                src={imageAt(src, "SY300")}
                alt=""
                className="max-h-full max-w-full object-contain animate-[float_6s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 900}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Three overlapping photo cards, slightly rotated, from back-left to front-right.
const PHOTO_SLOTS = [
  "left-0 top-6 h-40 w-40 -rotate-6 lg:h-44 lg:w-44",
  "left-[34%] top-0 z-10 h-52 w-52 lg:h-60 lg:w-60",
  "right-0 top-12 h-40 w-40 rotate-6 lg:h-44 lg:w-44",
];

function HeroButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20">
      {children}
    </button>
  );
}

import Link from "next/link";
import type { HeroSlide } from "@/lib/content/home";

type HeroCarouselMobileProps = {
  slides: HeroSlide[];
};

// Mobile hero: full-bleed, swipeable via native scroll-snap (spec 5.13). No arrows, no JS -
// pointer drag / touch scroll is the browser's own behaviour.
export function HeroCarouselMobile({ slides }: HeroCarouselMobileProps) {
  return (
    <div className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto">
      {slides.map((slide) => (
        <Link
          key={slide.href + slide.alt}
          href={slide.href}
          className="aspect-[2/1] w-full shrink-0 snap-start"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Amazon CDN creative (CLAUDE.md). */}
          <img src={slide.image} alt={slide.alt} className="h-full w-full object-cover object-top" />
        </Link>
      ))}
    </div>
  );
}

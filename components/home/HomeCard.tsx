import Link from "next/link";
import { CaretDown } from "@/components/layout/CaretDown";
import type { HomeCard as HomeCardData } from "@/lib/content/home";

type HomeCardProps = {
  card: HomeCardData;
};

// One category card: title (links to `href`) with a trailing chevron, then either a 2x2 tile
// grid or a single large image, then a "See more"-style footer link (spec 5.3, design.md 6.2).
// Used by both the desktop grid and the mobile stacked list (CLAUDE.md: extract shared JSX
// rather than duplicate it).
export function HomeCard({ card }: HomeCardProps) {
  return (
    <div className="bg-white px-5 pb-[15px] pt-5">
      <Link href={card.href} className="mb-3 flex items-center justify-between">
        <h2 className="text-[21px] font-bold leading-[27px] text-text">{card.title}</h2>
        <CaretDown className="h-3 w-3 shrink-0 -rotate-90 text-text" />
      </Link>

      {card.tiles ? (
        <div className="grid grid-cols-2 gap-2">
          {card.tiles.map((tile) => (
            <Link key={tile.href + tile.label} href={tile.href} className="block">
              <div className="aspect-square bg-tile-bg">
                {/* eslint-disable-next-line @next/next/no-img-element -- Amazon CDN creative (CLAUDE.md). */}
                <img src={tile.image} alt={tile.label} className="h-full w-full object-cover" />
              </div>
              <span className="mt-1 block text-xs text-text">{tile.label}</span>
            </Link>
          ))}
        </div>
      ) : (
        <Link href={card.href} className="block bg-tile-bg">
          {/* eslint-disable-next-line @next/next/no-img-element -- Amazon CDN creative (CLAUDE.md). */}
          <img src={card.image} alt={card.title} className="aspect-[2/1] w-full object-cover" />
        </Link>
      )}

      <Link
        href={card.href}
        className="mt-3 block text-[13px] text-link hover:text-link-hover hover:underline"
      >
        {card.footerLabel}
      </Link>
    </div>
  );
}

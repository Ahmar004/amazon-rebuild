import Link from "next/link";
import { Stars } from "@/components/product/Stars";
import { Price } from "@/components/product/Price";
import { imageAt } from "@/lib/assets";
import type { ProductSummary } from "@/lib/data/products";

type ProductTileProps = {
  item: ProductSummary;
};

const TILE_WIDTH = 180;

// One carousel card: image, a title link clamped to 3 lines, stars + count, price
// (docs/spec.md 5.5). No "Sponsored" label (CLAUDE.md).
export function ProductTile({ item }: ProductTileProps) {
  const href = `/dp/${item.asin}`;

  return (
    <div className="shrink-0" style={{ width: TILE_WIDTH }}>
      <Link href={href} className="flex h-[160px] items-center justify-center bg-tile-bg">
        {item.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageAt(item.imageUrl, "SY160")}
            alt={item.title}
            className="max-h-[160px] max-w-full object-contain"
          />
        )}
      </Link>
      <Link href={href} className="mt-2 block">
        <p className="line-clamp-3 text-sm text-link hover:text-link-hover">{item.title}</p>
      </Link>
      {item.ratingCount > 0 && (
        <div className="mt-1 flex items-center gap-1">
          <Stars rating={item.ratingAvg} size={12} />
          <span className="text-xs text-link">{item.ratingCount.toLocaleString("en-US")}</span>
        </div>
      )}
      <div className="mt-1">
        <Price priceCents={item.priceCents} listPriceCents={item.listPriceCents} />
      </div>
    </div>
  );
}

export { TILE_WIDTH };

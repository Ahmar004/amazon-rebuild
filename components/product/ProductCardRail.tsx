import { ProductRail } from "@/components/home/ProductRail";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import type { ProductSummary } from "@/lib/data/products";

type ProductCardRailProps = { title: string; subtitle?: string; href?: string; items: ProductSummary[] };

// A titled rail of product cards that fades in on scroll: home, product page, cart interstitial.
export function ProductCardRail({ title, subtitle, href, items }: ProductCardRailProps) {
  if (items.length === 0) return null;
  return (
    <Reveal>
      <ProductRail title={title} subtitle={subtitle} href={href}>
        {items.map((item) => (
          <ProductCard key={item.asin} item={item} />
        ))}
      </ProductRail>
    </Reveal>
  );
}

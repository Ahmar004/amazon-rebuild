import Link from "next/link";
import { Stars } from "@/components/product/Stars";
import { Price } from "@/components/product/Price";
import { Badge } from "@/components/ui/Badge";
import { ReviewsTabLink } from "@/components/product/ProductTabs";
import type { ProductDetail } from "@/lib/data/products";
import { ROUTES } from "@/lib/constants/links";

type TitleBlockProps = {
  product: ProductDetail;
  ratingAverage: number;
  ratingCount: number;
};

// The dataset stores a book's author in the brand column (scripts/import-catalogue.ts), so the
// department decides whether the line reads "by <Author>" or links to the brand's products.
const BOOKS_DEPARTMENT_SLUG = "books";

// Top of the purchase panel: brand, title, rating (opens the Reviews tab), badges and price.
export function TitleBlock({ product, ratingAverage, ratingCount }: TitleBlockProps) {
  const isBook = product.departmentSlug === BOOKS_DEPARTMENT_SLUG;
  const brandHref = `${ROUTES.search}?k=${encodeURIComponent(product.brand)}`;

  return (
    <div>
      <Link href={brandHref} className="text-sm font-semibold text-accent hover:text-accent-hover hover:underline">
        {isBook ? `by ${product.brand}` : `More from ${product.brand}`}
      </Link>
      <h1 className="mt-1 text-xl font-bold leading-snug text-fg sm:text-2xl">{product.title}</h1>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {ratingCount > 0 && (
          <ReviewsTabLink>
            <span className="font-semibold text-fg">{ratingAverage}</span>
            <Stars rating={ratingAverage} />
            <span className="text-accent">{ratingCount.toLocaleString("en-US")} ratings</span>
          </ReviewsTabLink>
        )}
        {product.isBestSeller && <Badge tone="warning">Best Seller</Badge>}
      </div>

      <div className="mt-4">
        <Price priceCents={product.priceCents} listPriceCents={product.listPriceCents} size="lg" />
      </div>
    </div>
  );
}

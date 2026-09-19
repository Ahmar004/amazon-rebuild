import Link from "next/link";
import { Stars } from "@/components/product/Stars";
import { Price } from "@/components/product/Price";
import type { ProductDetail } from "@/lib/data/products";

type TitleBlockProps = {
  product: ProductDetail;
  ratingAverage: number;
  ratingCount: number;
};

// The dataset stores a book's author in the same brand column the store name would otherwise
// use (scripts/import-catalogue.ts), so the department alone tells us which label to show
// (plan: "for books: 'by <Author> (Author)'").
const BOOKS_DEPARTMENT_SLUG = "books";

// Title, brand line, rating row, best-seller badge and price block (docs/spec.md 5.5, centre
// column). Reuses Stars and Price from Slice 3 rather than duplicating their markup.
export function TitleBlock({ product, ratingAverage, ratingCount }: TitleBlockProps) {
  const isBook = product.departmentSlug === BOOKS_DEPARTMENT_SLUG;
  const brandHref = `/s?k=${encodeURIComponent(product.brand)}`;

  return (
    <div>
      <h1 className="text-2xl leading-8 text-text">{product.title}</h1>

      {isBook ? (
        <p className="mt-1 text-sm text-text">
          by{" "}
          <Link href={brandHref} className="text-link hover:text-link-hover hover:underline">
            {product.brand}
          </Link>{" "}
          (Author)
        </p>
      ) : (
        <Link
          href={brandHref}
          className="mt-1 inline-block text-sm text-link hover:text-link-hover hover:underline"
        >
          Visit the {product.brand} Store
        </Link>
      )}

      {ratingCount > 0 && (
        <Link href="#reviews" className="mt-2 flex items-center gap-1 text-sm">
          <span className="text-link">{ratingAverage}</span>
          <Stars rating={ratingAverage} />
          <span aria-hidden="true" className="text-[10px] text-text-muted">
            &#9662;
          </span>
          <span className="text-link hover:text-link-hover">{ratingCount.toLocaleString("en-US")} ratings</span>
        </Link>
      )}

      {product.isBestSeller && (
        <span className="mt-2 inline-block bg-best-seller px-1.5 py-0.5 text-xs font-bold text-white">
          Best Seller
        </span>
      )}

      <hr className="my-3 border-border" />

      <Price priceCents={product.priceCents} listPriceCents={product.listPriceCents} />
    </div>
  );
}

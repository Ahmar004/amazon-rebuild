import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct, getRelated, getTopAsins, splitRelatedCarousels } from "@/lib/data/products";
import { getReviewSummary, getReviews } from "@/lib/data/reviews";
import { parseReviewsParams, type RawReviewsParams } from "@/lib/reviews/query";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { Gallery } from "@/components/product/Gallery";
import { TitleBlock } from "@/components/product/TitleBlock";
import { AboutThisItem } from "@/components/product/AboutThisItem";
import { BuyBox } from "@/components/product/BuyBox";
import { Carousel } from "@/components/product/Carousel";
import { ProductInformation } from "@/components/product/ProductInformation";
import { StickyProductNav } from "@/components/product/StickyProductNav";
import { ReviewSummary } from "@/components/product/ReviewSummary";
import { ReviewList } from "@/components/product/ReviewList";

// Prerenders the 200 most-rated products; other ASINs render on first visit and are then cached
// (plan: "generateStaticParams returns getTopAsins(200)").
export async function generateStaticParams() {
  const asins = await getTopAsins(200);
  return asins.map((id) => ({ id }));
}

type ProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawReviewsParams>;
};

// Product detail page (docs/spec.md 5.5). params is awaited inside <Suspense> even for the
// prerendered ASINs, per the ISR-with-Cache-Components guide, so unlisted ASINs still get an
// App Shell instead of a full server-render wait.
export default function ProductPage({ params, searchParams }: ProductPageProps) {
  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductPageForParams params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductPageForParams({ params, searchParams }: ProductPageProps) {
  const { id: asin } = await params;
  const product = await getProduct(asin);
  if (!product) notFound();

  const [relatedItems, reviewSummary] = await Promise.all([
    getRelated(asin, product.departmentSlug),
    getReviewSummary(asin),
  ]);
  const { alsoViewed, related } = splitRelatedCarousels(relatedItems, product.priceCents);

  return (
    <div id="top" className="mx-auto max-w-[1500px] bg-surface px-4 py-3">
      <StickyProductNav sentinelId="buy-box-column" title={product.title} imageUrl={product.imageUrl} />

      <Breadcrumb categoryPath={product.categoryPath} departmentSlug={product.departmentSlug} />

      <div className="mt-3 flex flex-col gap-6 md:flex-row">
        <div className="md:w-[42%]">
          <Gallery images={product.images} title={product.title} />
        </div>

        <div className="min-w-0 md:flex-1">
          <TitleBlock product={product} ratingAverage={reviewSummary.average} ratingCount={reviewSummary.count} />
          <div id="about-this-item" className="mt-4">
            <AboutThisItem features={product.features} />
          </div>
        </div>

        <div id="buy-box-column" className="md:w-[245px] md:shrink-0">
          <Suspense fallback={<BuyBoxSkeleton />}>
            <BuyBox product={product} />
          </Suspense>
        </div>
      </div>

      <div id="similar" className="mt-8 space-y-8">
        <Carousel title="Customers also viewed these products" items={alsoViewed} />
        <Carousel title="Products related to this item" items={related} />
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <ProductInformation details={product.details} description={product.description} />
      </div>

      <div id="reviews" className="mt-8 flex flex-col gap-8 border-t border-border pt-6 md:flex-row">
        <ReviewSummary
          asin={asin}
          average={reviewSummary.average}
          count={reviewSummary.count}
          percents={reviewSummary.percents}
        />
        <Suspense fallback={<ReviewListSkeleton />}>
          <ReviewsForParams asin={asin} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

// The star filter and page number come from the URL (request-time), so this small boundary is
// the only part of the reviews section that can't be part of the cached shell.
async function ReviewsForParams({ asin, searchParams }: { asin: string; searchParams: Promise<RawReviewsParams> }) {
  const raw = await searchParams;
  const query = parseReviewsParams(raw);
  const reviewsPage = await getReviews(asin, query);
  return <ReviewList reviews={reviewsPage.items} total={reviewsPage.total} query={query} />;
}

function ProductPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6" aria-hidden="true">
      <div className="h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
      <div className="mt-4 flex flex-col gap-6 md:flex-row">
        <div className="h-[500px] animate-pulse rounded bg-surface-muted md:w-[42%]" />
        <div className="h-[500px] flex-1 animate-pulse rounded bg-surface-muted" />
        <div className="h-[400px] animate-pulse rounded bg-surface-muted md:w-[245px]" />
      </div>
    </div>
  );
}

function BuyBoxSkeleton() {
  return <div className="h-[320px] animate-pulse rounded-xl border border-border bg-surface-muted" aria-hidden="true" />;
}

function ReviewListSkeleton() {
  return <div className="h-[400px] flex-1 animate-pulse rounded bg-surface-muted" aria-hidden="true" />;
}

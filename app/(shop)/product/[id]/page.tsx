import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct, getRelated, getTopAsins, splitRelatedCarousels } from "@/lib/data/products";
import { getReviewSummary, getReviews } from "@/lib/data/reviews";
import { parseReviewsParams, type RawReviewsParams } from "@/lib/reviews/query";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { Gallery } from "@/components/product/Gallery";
import { TitleBlock } from "@/components/product/TitleBlock";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductOverview } from "@/components/product/ProductOverview";
import { SpecsTable } from "@/components/product/SpecsTable";
import { ReviewSummary } from "@/components/product/ReviewSummary";
import { ReviewList } from "@/components/product/ReviewList";
import { ReviewComposer } from "@/components/reviews/ReviewComposer";
import { ViewTracker } from "@/components/history/ViewTracker";
import { ProductCardRail } from "@/components/product/ProductCardRail";
import { ROUTES } from "@/lib/constants/links";

// Prerenders the 200 most-rated products; other ASINs render on first visit and are then cached.
export async function generateStaticParams() {
  const asins = await getTopAsins(200);
  return asins.map((id) => ({ id }));
}

type ProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawReviewsParams>;
};

// Product page (frontend-rebuild.md C10): the gallery and the Overview / Specs / Reviews tabs on
// the left, one sticky purchase panel on the right, related-product rails below. params is
// awaited inside <Suspense> so ASINs outside the prerendered 200 still get an instant shell.
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

  const [relatedItems, reviewSummary] = await Promise.all([getRelated(asin, product.categorySlug), getReviewSummary(asin)]);
  const { alsoViewed, related } = splitRelatedCarousels(relatedItems, product.priceCents);

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-6 sm:py-6">
      <ViewTracker asin={asin} />
      <Breadcrumb categoryPath={product.categoryPath} categorySlug={product.categorySlug} />

      {/* Phones stack gallery, purchase panel, tabs; from 1024px the panel spans both rows on the
          right and stays in view while the shopper reads the tabs. */}
      <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[auto_1fr] lg:gap-8">
        <div className="min-w-0 rounded-2xl border border-border bg-surface p-3 shadow-card sm:p-4 lg:col-start-1 lg:row-start-1">
          <Gallery images={product.images} title={product.title} />
        </div>

        <aside className="self-start rounded-2xl border border-border bg-surface p-5 shadow-card lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <TitleBlock product={product} ratingAverage={reviewSummary.average} ratingCount={reviewSummary.count} />
          <hr className="my-4 border-border" />
          <Suspense fallback={<div className="skeleton h-[300px] rounded-xl" aria-hidden="true" />}>
            <BuyBox product={product} />
          </Suspense>
        </aside>

        <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6 lg:col-start-1 lg:row-start-2">
          <ProductTabs
            reviewCount={reviewSummary.count}
            panels={{
              overview: <ProductOverview features={product.features} description={product.description} />,
              specs: <SpecsTable details={product.details} />,
              reviews: (
                <div className="grid gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
                  <div>
                    <ReviewSummary average={reviewSummary.average} count={reviewSummary.count} percents={reviewSummary.percents} />
                    <Suspense fallback={null}>
                      <ReviewComposer asin={asin} />
                    </Suspense>
                  </div>
                  <Suspense fallback={<div className="skeleton h-[400px] rounded-xl" aria-hidden="true" />}>
                    <ReviewsForParams asin={asin} searchParams={searchParams} />
                  </Suspense>
                </div>
              ),
            }}
          />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <ProductCardRail title="Customers also viewed" items={alsoViewed} />
        <ProductCardRail title={`More in ${product.categoryName}`} href={`${ROUTES.search}?i=${product.categorySlug}`} items={related} />
      </div>
    </div>
  );
}

// The star filter and page come from the URL (request-time), so only this part of the Reviews
// tab sits outside the cached shell.
async function ReviewsForParams({ asin, searchParams }: { asin: string; searchParams: Promise<RawReviewsParams> }) {
  const query = parseReviewsParams(await searchParams);
  const reviewsPage = await getReviews(asin, query);
  return <ReviewList reviews={reviewsPage.items} total={reviewsPage.total} query={query} />;
}

function ProductPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-6 sm:py-6" aria-hidden="true">
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        <div className="skeleton h-[520px] rounded-2xl" />
        <div className="skeleton h-[520px] rounded-2xl" />
      </div>
    </div>
  );
}

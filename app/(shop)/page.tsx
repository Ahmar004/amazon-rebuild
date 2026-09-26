import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryCard } from "@/components/home/CategoryCard";
import { PersonalRails } from "@/components/home/PersonalRails";
import { ProductCardRail } from "@/components/product/ProductCardRail";
import { Reveal } from "@/components/motion/Reveal";
import { getCategoryPreviews } from "@/lib/data/categories";
import { getBestSellersRail, getDealsRail, getCategoryRails, getHeroSlides } from "@/lib/data/home";
import { DEALS_HREF } from "@/lib/constants/home";
import { BEST_SELLERS_HREF, ROUTES } from "@/lib/constants/links";

// Home (frontend-rebuild.md points 5 and 8, C6): hero, category tiles, the shopper's own rails,
// then deal, best-seller and category rails of real products. The catalogue sections are cached;
// only the personal rails read the session, so they stream in behind <Suspense>.
export default function Home() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-3 py-4 sm:space-y-8 sm:px-6 sm:py-6">
      <Hero />
      <Categories />
      {/* No skeleton: most shoppers start with no personal rails, and a placeholder that then
          vanishes would shift the page. */}
      <Suspense fallback={null}>
        <PersonalRails />
      </Suspense>
      <CatalogueRails />
    </div>
  );
}

async function Hero() {
  "use cache";
  cacheLife("days");
  cacheTag("home", "products");
  return <HeroCarousel slides={await getHeroSlides()} />;
}

async function Categories() {
  "use cache";
  cacheLife("days");
  cacheTag("home", "categories", "products");
  const categories = await getCategoryPreviews();
  return (
    <section>
      <Reveal>
        <h2 className="text-xl font-bold text-fg sm:text-2xl">Shop by category</h2>
      </Reveal>
      <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
        {categories.map((category, i) => (
          <Reveal key={category.id} as="li" delay={(i % 8) * 50}>
            <CategoryCard category={category} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

async function CatalogueRails() {
  "use cache";
  cacheLife("hours");
  cacheTag("home", "products");
  const [deals, bestSellers, categoryRails] = await Promise.all([getDealsRail(), getBestSellersRail(), getCategoryRails()]);

  return (
    <>
      <ProductCardRail title="Today's Deals" subtitle="The biggest discounts right now" href={DEALS_HREF} items={deals} />
      <ProductCardRail title="Best Sellers" subtitle="What shoppers are buying most" href={BEST_SELLERS_HREF} items={bestSellers} />
      {categoryRails.map(({ category, items }) => (
        <ProductCardRail key={category.id} title={category.name} href={`${ROUTES.search}?i=${category.slug}`} items={items} />
      ))}
    </>
  );
}


import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { DepartmentCard } from "@/components/home/DepartmentCard";
import { ProductRail } from "@/components/home/ProductRail";
import { PersonalRails } from "@/components/home/PersonalRails";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { getDepartmentPreviews } from "@/lib/data/departments";
import { getBestSellersRail, getDealsRail, getDepartmentRails, getHeroSlides } from "@/lib/data/home";
import { DEALS_HREF } from "@/lib/constants/home";
import { BEST_SELLERS_HREF, ROUTES } from "@/lib/constants/links";
import type { ProductSummary } from "@/lib/data/products";

// Home (frontend-rebuild.md points 5 and 8, C6): hero, department tiles, the shopper's own rails,
// then deal, best-seller and department rails of real products. The catalogue sections are cached;
// only the personal rails read the session, so they stream in behind <Suspense>.
export default function Home() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-3 py-4 sm:space-y-8 sm:px-6 sm:py-6">
      <Hero />
      <Departments />
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

async function Departments() {
  "use cache";
  cacheLife("days");
  cacheTag("home", "departments", "products");
  const departments = await getDepartmentPreviews();
  return (
    <section>
      <Reveal>
        <h2 className="text-xl font-bold text-fg sm:text-2xl">Shop by department</h2>
      </Reveal>
      <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
        {departments.map((department, i) => (
          <Reveal key={department.id} as="li" delay={(i % 8) * 50}>
            <DepartmentCard department={department} />
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
  const [deals, bestSellers, departmentRails] = await Promise.all([getDealsRail(), getBestSellersRail(), getDepartmentRails()]);

  return (
    <>
      <Rail title="Today's Deals" subtitle="The biggest discounts right now" href={DEALS_HREF} items={deals} />
      <Rail title="Best Sellers" subtitle="What shoppers are buying most" href={BEST_SELLERS_HREF} items={bestSellers} />
      {departmentRails.map(({ department, items }) => (
        <Rail key={department.id} title={department.name} href={`${ROUTES.search}?i=${department.slug}`} items={items} />
      ))}
    </>
  );
}

function Rail({ title, subtitle, href, items }: { title: string; subtitle?: string; href: string; items: ProductSummary[] }) {
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

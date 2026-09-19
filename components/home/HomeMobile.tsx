import { Suspense } from "react";
import { HeroCarouselMobile } from "@/components/home/HeroCarouselMobile";
import { SignInBand } from "@/components/home/SignInBand";
import { SignInBandSession } from "@/components/home/SignInBandSession";
import { HomeCard } from "@/components/home/HomeCard";
import { ExploreDepartmentsCard } from "@/components/home/ExploreDepartmentsCard";
import type { HeroSlide, HomeCard as HomeCardData } from "@/lib/content/home";
import type { Department } from "@/lib/data/departments";

type HomeMobileProps = {
  heroSlides: HeroSlide[];
  homeCards: HomeCardData[];
  departments: Department[];
};

// Mobile home, top to bottom per spec 5.13: hero, sign-in band, one card per row, then
// "Explore Departments". Reuses the same HeroSlide/HomeCard data and HomeCard component as
// the desktop layout - only the composition differs (CLAUDE.md: deliberate separate designs).
export function HomeMobile({ heroSlides, homeCards, departments }: HomeMobileProps) {
  return (
    <div className="flex flex-col gap-2 bg-page-bg pb-2 md:hidden">
      <HeroCarouselMobile slides={heroSlides} />
      <Suspense fallback={<SignInBand variant="mobile" />}>
        <SignInBandSession variant="mobile" />
      </Suspense>
      {homeCards.map((card) => (
        <HomeCard key={card.title} card={card} />
      ))}
      <ExploreDepartmentsCard departments={departments} />
    </div>
  );
}

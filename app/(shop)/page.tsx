import { cacheLife, cacheTag } from "next/cache";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HomeCardGrid } from "@/components/home/HomeCardGrid";
import { SignInBand } from "@/components/home/SignInBand";
import { HomeMobile } from "@/components/home/HomeMobile";
import { heroSlides, homeCards } from "@/lib/content/home";
import { getDepartments } from "@/lib/data/departments";

// The Amazon home page (spec 5.3, 5.13; design.md 6.2): hero carousel, overlapping card grid
// and the signed-out sign-in band on desktop; hero, sign-in band, one card per row and
// "Explore Departments" on mobile. Shared catalogue content only (no cookies/session read in
// this slice, since the sign-in band shows unconditionally until Slice 6), so the whole page
// is cacheable.
export default async function Home() {
  "use cache";
  cacheLife("days");
  cacheTag("home");

  const departments = await getDepartments();

  return (
    <>
      <div className="hidden md:block">
        <HeroCarousel slides={heroSlides} />
        <HomeCardGrid cards={homeCards} />
        <div className="mt-5">
          <SignInBand variant="desktop" />
        </div>
      </div>

      <HomeMobile heroSlides={heroSlides} homeCards={homeCards} departments={departments} />
    </>
  );
}

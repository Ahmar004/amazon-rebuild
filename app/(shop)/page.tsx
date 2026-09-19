import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HomeCardGrid } from "@/components/home/HomeCardGrid";
import { SignInBand } from "@/components/home/SignInBand";
import { SignInBandSession } from "@/components/home/SignInBandSession";
import { HomeMobile } from "@/components/home/HomeMobile";
import { heroSlides, homeCards } from "@/lib/content/home";
import { getDepartments } from "@/lib/data/departments";

// The Amazon home page (spec 5.3, 5.13; design.md 6.2): hero carousel, overlapping card grid
// and the sign-in band (signed out only, Slice 6) on desktop; hero, sign-in band, one card per
// row and "Explore Departments" on mobile. Home itself is not cached (the sign-in band reads the
// session and must render inside <Suspense>, and CLAUDE.md forbids cookies() anywhere inside a
// 'use cache' scope, Suspense boundary or not); the static catalogue content it composes is
// cached separately in CachedHomeShell.
export default async function Home() {
  const departments = await getDepartments();

  return (
    <>
      <div className="hidden bg-page-bg md:block">
        <CachedHomeShell />
        <div className="mt-5">
          <Suspense fallback={<SignInBand variant="desktop" />}>
            <SignInBandSession variant="desktop" />
          </Suspense>
        </div>
      </div>

      <HomeMobile heroSlides={heroSlides} homeCards={homeCards} departments={departments} />
    </>
  );
}

// The desktop hero carousel and card grid: static marketing content, cached as a unit.
async function CachedHomeShell() {
  "use cache";
  cacheLife("days");
  cacheTag("home");

  return (
    <>
      <HeroCarousel slides={heroSlides} />
      <HomeCardGrid cards={homeCards} />
    </>
  );
}


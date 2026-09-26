import { PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { getCategoryPreviews } from "@/lib/data/categories";
import { imageAt } from "@/lib/assets";
import { formatPrice } from "@/lib/pricing/money";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/pricing/shipping";

const PANEL_TILES = 6;
const STRIP_TILES = 12;

// Tilt and float offset per photo tile, so the grid reads as a loose, hand-placed collage.
const TILE_TILT = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "-rotate-2", "rotate-1"];

type Tile = { name: string; image: string };

// Imagery beside the sign-in and register card (point 14): real catalogue photos, one per
// category, floating in a gradient panel with what the store offers. Desktop gets the panel;
// narrow screens get a scrolling photo strip above the card instead.
export async function AuthShowcase() {
  const categories = await getCategoryPreviews();
  const tiles: Tile[] = categories
    .filter((d) => d.images.length > 0)
    .map((d) => ({ name: d.name, image: d.images[0] }));

  const perks = [
    { icon: Truck, text: `Free shipping on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)}` },
    { icon: ShieldCheck, text: "Secure one-page card checkout" },
    { icon: PackageCheck, text: "Track every order and cancel until it ships" },
  ];

  return (
    <>
      <section
        aria-label="Why Shopeedo"
        className="relative hidden overflow-hidden rounded-3xl bg-linear-to-br from-hero-teal-from to-hero-teal-to p-10 text-hero-fg shadow-pop lg:block"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-hero-fg/10 blur-3xl animate-[drift_14s_ease-in-out_infinite]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-hero-fg/10 blur-3xl animate-[drift_18s_ease-in-out_infinite_reverse]" />

        <div className="relative animate-[rise-in_700ms_ease-out_both]">
          <p className="text-sm font-semibold uppercase tracking-wider text-hero-fg/80">Shop {categories.length} categories</p>
          <h2 className="mt-2 max-w-md text-3xl font-bold leading-tight">Everything you need, a few clicks away.</h2>
        </div>

        <ul className="relative mt-8 grid grid-cols-3 gap-4">
          {tiles.slice(0, PANEL_TILES).map((tile, i) => (
            <li
              key={tile.name}
              className={`animate-[rise-in_800ms_ease-out_both] ${TILE_TILT[i % TILE_TILT.length]}`}
              style={{ animationDelay: `${200 + i * 110}ms` }}
            >
              <div className="animate-[float_7s_ease-in-out_infinite]" style={{ animationDelay: `${i * 700}ms` }}>
                <div className="flex aspect-square items-center justify-center rounded-2xl bg-white p-3 shadow-pop transition duration-300 hover:scale-105 hover:rotate-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- dataset image, pre-sized by URL */}
                  <img src={imageAt(tile.image, "SY200")} alt="" className="max-h-full max-w-full object-contain" />
                </div>
                <p className="mt-2 truncate text-center text-xs font-medium text-hero-fg/85">{tile.name}</p>
              </div>
            </li>
          ))}
        </ul>

        <ul className="relative mt-8 space-y-3">
          {perks.map(({ icon: Icon, text }, i) => (
            <li
              key={text}
              className="flex items-center gap-3 text-sm animate-[rise-in_700ms_ease-out_both]"
              style={{ animationDelay: `${900 + i * 120}ms` }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hero-fg/15">
                <Icon size={16} aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </section>

      <PhotoStrip tiles={tiles.slice(0, STRIP_TILES)} />
    </>
  );
}

// Endless photo strip for narrow screens: the list is rendered twice and slid by half its width,
// so the loop has no visible seam.
function PhotoStrip({ tiles }: { tiles: Tile[] }) {
  if (tiles.length === 0) return null;
  return (
    <div aria-hidden="true" className="relative -mx-4 overflow-hidden sm:-mx-6 lg:hidden">
      <div className="flex w-max gap-3 animate-[marquee_40s_linear_infinite]">
        {[...tiles, ...tiles].map((tile, i) => (
          <div key={i} className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-border bg-white p-2 shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element -- dataset image, pre-sized by URL */}
            <img src={imageAt(tile.image, "SY160")} alt="" className="max-h-full max-w-full object-contain" />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-bg" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-bg" />
    </div>
  );
}

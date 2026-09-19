// Amazon's brand asset URLs (sprites, images), all in one module per CLAUDE.md: "Amazon's
// brand assets ... load from Amazon's CDN, with every URL kept in lib/assets.ts."
// Sprite coordinates captured against the live nav/footer sprite sheets on 2026-09-19.

export const NAV_SPRITE =
  "https://m.media-amazon.com/images/G/01/gno/sprites/nav-sprite-global-1x-reorg-privacy._CB779528203_.png";

export const FLAG_SPRITE = "https://m.media-amazon.com/images/S/sash/MAbi1rCjQI9H2y0.png";

// Task 4: the dog illustration on Amazon's 404 page.
export const NOT_FOUND_IMAGE = "https://m.media-amazon.com/images/G/01/error/title._TTD_.png";

// Slice 5: the kettle illustration on Amazon's empty-cart state (captured live 2026-09-19).
export const EMPTY_CART_IMAGE = "https://m.media-amazon.com/images/G/01/cart/empty/kettle-desaturated._CB445243794_.svg";

// Amazon's product images carry a size suffix such as "._AC_SX300_" before the extension.
// Replaces (or inserts) that suffix so a single catalogue image URL can be requested at the
// size a given surface needs (CLAUDE.md: "Product images use Amazon's size suffixes").
export function imageAt(url: string, size: string): string {
  const suffix = `._AC_${size}_`;
  const match = url.match(/^(.*?)(\._[A-Z0-9,._]+_)?(\.[a-zA-Z]+)$/);
  if (!match) return url;
  const [, base, , ext] = match;
  return `${base}${suffix}${ext}`;
}

export type SpritePosition = {
  position: string;
  width: number;
  height: number;
};

export const SPRITES: Record<"logo" | "cart" | "hamburger" | "location" | "usFlag", SpritePosition> = {
  logo: { position: "-9px -125px", width: 98, height: 34 },
  cart: { position: "-10px -340px", width: 38, height: 26 },
  hamburger: { position: "-172px -255px", width: 17, height: 14 },
  location: { position: "-71px -378px", width: 15, height: 18 },
  usFlag: { position: "0px -130px", width: 22, height: 16 },
};

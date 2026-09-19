// Amazon's brand asset URLs (sprites, images), all in one module per CLAUDE.md: "Amazon's
// brand assets ... load from Amazon's CDN, with every URL kept in lib/assets.ts."
// Sprite coordinates captured against the live nav/footer sprite sheets on 2026-09-19.

export const NAV_SPRITE =
  "https://m.media-amazon.com/images/G/01/gno/sprites/nav-sprite-global-1x-reorg-privacy._CB779528203_.png";

export const FLAG_SPRITE = "https://m.media-amazon.com/images/S/sash/MAbi1rCjQI9H2y0.png";

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

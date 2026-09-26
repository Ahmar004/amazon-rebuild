// Buying / Selling mode (frontend-rebuild.md D4). The mode is remembered in a cookie and only
// changes which quick links the header shows; every page works in either mode.
export const SHOP_MODE = { buying: "buying", selling: "selling" } as const;
export type ShopMode = (typeof SHOP_MODE)[keyof typeof SHOP_MODE];

export const MODE_COOKIE = "shop_mode";
export const MODE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseMode(value: string | null | undefined): ShopMode {
  return value === SHOP_MODE.selling ? SHOP_MODE.selling : SHOP_MODE.buying;
}

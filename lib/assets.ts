// Product photos come from the catalogue dataset's image URLs (frontend-rebuild.md C4). Those URLs
// carry a size suffix such as "._AC_SX300_" before the extension; imageAt() replaces (or inserts)
// it so one catalogue URL can be requested at the size a given surface needs. Photos sellers upload
// have a single size and are returned unchanged.
import { isListingPhotoUrl } from "@/lib/listings/photos";

export function imageAt(url: string, size: string): string {
  if (isListingPhotoUrl(url)) return url;
  const suffix = `._AC_${size}_`;
  const match = url.match(/^(.*?)(\._[A-Z0-9,._]+_)?(\.[a-zA-Z]+)$/);
  if (!match) return url;
  const [, base, , ext] = match;
  return `${base}${suffix}${ext}`;
}

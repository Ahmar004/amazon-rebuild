// Delivery location: cookie shape, ZIP validation, and the Zippopotam lookup used by the
// location popover/modal (slice 1, task 2/3). Kept free of any DOM or Next.js API so it can
// run on the server and in tests.

export type DeliveryLocation = {
  zip: string;
  city: string;
  state: string;
};

export const DEFAULT_LOCATION: DeliveryLocation = {
  zip: "10001",
  city: "New York",
  state: "NY",
};

export const LOCATION_COOKIE = "deliver_to";

const ZIP_PATTERN = /^\d{5}$/;

export function isValidZip(zip: string): boolean {
  return ZIP_PATTERN.test(zip);
}

export function parseLocationCookie(value: string | undefined): DeliveryLocation {
  if (!value) return DEFAULT_LOCATION;

  try {
    const parsed = JSON.parse(value);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.zip === "string" &&
      typeof parsed.city === "string" &&
      typeof parsed.state === "string"
    ) {
      return { zip: parsed.zip, city: parsed.city, state: parsed.state };
    }
    return DEFAULT_LOCATION;
  } catch {
    return DEFAULT_LOCATION;
  }
}

export function serializeLocation(loc: DeliveryLocation): string {
  return JSON.stringify(loc);
}

type ZippopotamResponse = {
  "post code": string;
  places: { "place name": string; "state abbreviation": string }[];
};

export async function lookupZip(
  zip: string,
  fetcher: typeof fetch = fetch,
): Promise<DeliveryLocation | null> {
  if (!isValidZip(zip)) return null;

  try {
    const response = await fetcher(`https://api.zippopotam.us/us/${zip}`);
    if (!response.ok) return null;

    const data = (await response.json()) as ZippopotamResponse;
    const place = data.places?.[0];
    if (!place) return null;

    return {
      zip: data["post code"],
      city: place["place name"],
      state: place["state abbreviation"],
    };
  } catch {
    return null;
  }
}

export function formatLocation(loc: DeliveryLocation): string {
  return `${loc.city} ${loc.zip}`;
}

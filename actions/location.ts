"use server";

// Server actions behind the "Deliver to" header block and its LocationModal (slice 1, task 3).
// setLocation validates and geocodes a zip, then persists it to the deliver_to cookie;
// dismissLocationPrompt just flips loc_prompt so the first-visit popover doesn't come back.
import { cookies } from "next/headers";
import {
  isValidZip,
  lookupZip,
  serializeLocation,
  LOCATION_COOKIE,
  LOCATION_PROMPT_COOKIE,
  type DeliveryLocation,
} from "@/lib/location";

const INVALID_ZIP_ERROR = "Please enter a valid US zip code";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type SetLocationResult = { ok: true; location: DeliveryLocation } | { ok: false; error: string };

export async function setLocation(
  zip: string,
  // Injected only by tests (see tests/unit/actions/location.test.ts); production callers
  // always use the default `fetch`.
  fetcher: typeof fetch = fetch,
): Promise<SetLocationResult> {
  if (!isValidZip(zip)) {
    return { ok: false, error: INVALID_ZIP_ERROR };
  }

  const location = await lookupZip(zip, fetcher);
  if (!location) {
    return { ok: false, error: INVALID_ZIP_ERROR };
  }

  const store = await cookies();
  store.set(LOCATION_COOKIE, serializeLocation(location), {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    httpOnly: false,
  });
  store.set(LOCATION_PROMPT_COOKIE, "1", {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    httpOnly: false,
  });

  return { ok: true, location };
}

export async function dismissLocationPrompt(): Promise<void> {
  const store = await cookies();
  store.set(LOCATION_PROMPT_COOKIE, "1", {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    httpOnly: false,
  });
}

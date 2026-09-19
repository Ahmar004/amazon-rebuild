import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOCATION_COOKIE, LOCATION_PROMPT_COOKIE } from "@/lib/location";

const cookieStore = {
  get: vi.fn(),
  has: vi.fn(),
  set: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

const { setLocation, dismissLocationPrompt } = await import("@/actions/location");

const INVALID_ZIP_ERROR = "Please enter a valid US zip code";

describe("setLocation", () => {
  beforeEach(() => {
    cookieStore.set.mockClear();
  });

  it("returns the error for an invalid zip without calling the lookup", async () => {
    const fetcher = vi.fn();

    const result = await setLocation("abc", fetcher as unknown as typeof fetch);

    expect(result).toEqual({ ok: false, error: INVALID_ZIP_ERROR });
    expect(fetcher).not.toHaveBeenCalled();
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("returns the error when the zip lookup finds nothing", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) });

    const result = await setLocation("00000", fetcher as unknown as typeof fetch);

    expect(result).toEqual({ ok: false, error: INVALID_ZIP_ERROR });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("sets both cookies and returns the location for a good zip", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        "post code": "90210",
        places: [{ "place name": "Beverly Hills", "state abbreviation": "CA" }],
      }),
    });

    const result = await setLocation("90210", fetcher as unknown as typeof fetch);

    expect(result).toEqual({
      ok: true,
      location: { zip: "90210", city: "Beverly Hills", state: "CA" },
    });
    expect(cookieStore.set).toHaveBeenCalledWith(
      LOCATION_COOKIE,
      JSON.stringify({ zip: "90210", city: "Beverly Hills", state: "CA" }),
      expect.objectContaining({ path: "/", sameSite: "lax", httpOnly: false }),
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      LOCATION_PROMPT_COOKIE,
      "1",
      expect.objectContaining({ path: "/", sameSite: "lax" }),
    );
  });
});

describe("dismissLocationPrompt", () => {
  it("sets the loc_prompt cookie", async () => {
    cookieStore.set.mockClear();

    await dismissLocationPrompt();

    expect(cookieStore.set).toHaveBeenCalledWith(
      LOCATION_PROMPT_COOKIE,
      "1",
      expect.objectContaining({ path: "/", sameSite: "lax" }),
    );
  });
});

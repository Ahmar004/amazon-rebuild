import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LOCATION,
  formatLocation,
  isValidZip,
  lookupZip,
  parseLocationCookie,
  serializeLocation,
} from "@/lib/location";

describe("isValidZip", () => {
  it("accepts a 5-digit zip", () => {
    expect(isValidZip("10001")).toBe(true);
  });

  it("rejects too short, too long, non-digit and padded zips", () => {
    expect(isValidZip("1000")).toBe(false);
    expect(isValidZip("100011")).toBe(false);
    expect(isValidZip("abcde")).toBe(false);
    expect(isValidZip(" 10001")).toBe(false);
  });
});

describe("parseLocationCookie", () => {
  it("returns the default location when the cookie is undefined", () => {
    expect(parseLocationCookie(undefined)).toEqual(DEFAULT_LOCATION);
  });

  it("returns the default location when the cookie is malformed JSON", () => {
    expect(parseLocationCookie("not-json")).toEqual(DEFAULT_LOCATION);
  });

  it("round-trips valid JSON through serializeLocation", () => {
    const loc = { zip: "90210", city: "Beverly Hills", state: "CA" };
    expect(parseLocationCookie(serializeLocation(loc))).toEqual(loc);
  });
});

describe("lookupZip", () => {
  it("parses the Zippopotam response shape", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        "post code": "90210",
        places: [{ "place name": "Beverly Hills", "state abbreviation": "CA" }],
      }),
    });

    const result = await lookupZip("90210", fetcher as unknown as typeof fetch);

    expect(result).toEqual({ zip: "90210", city: "Beverly Hills", state: "CA" });
    expect(fetcher).toHaveBeenCalledWith("https://api.zippopotam.us/us/90210");
  });

  it("returns null on a 404 response", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) });

    const result = await lookupZip("00000", fetcher as unknown as typeof fetch);

    expect(result).toBeNull();
  });

  it("returns null for an invalid zip without calling the fetcher", async () => {
    const fetcher = vi.fn();

    const result = await lookupZip("abcde", fetcher as unknown as typeof fetch);

    expect(result).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("returns null on a network error", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await lookupZip("10001", fetcher as unknown as typeof fetch);

    expect(result).toBeNull();
  });
});

describe("formatLocation", () => {
  it("formats city and zip", () => {
    expect(formatLocation({ zip: "10001", city: "New York", state: "NY" })).toBe("New York 10001");
  });
});

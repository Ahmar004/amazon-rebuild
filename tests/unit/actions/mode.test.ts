import { beforeEach, describe, expect, it, vi } from "vitest";
import { MODE_COOKIE } from "@/lib/constants/mode";

const set = vi.fn();
const redirect = vi.fn((to: string) => {
  throw new Error(`redirect:${to}`);
});
vi.mock("next/headers", () => ({ cookies: async () => ({ set }) }));
vi.mock("next/navigation", () => ({ redirect }));

const { switchMode } = await import("@/actions/mode");

function form(mode: string) {
  const data = new FormData();
  data.set("mode", mode);
  return data;
}

describe("switchMode", () => {
  beforeEach(() => vi.clearAllMocks());

  it("remembers Selling and opens the seller dashboard", async () => {
    await expect(switchMode(form("selling"))).rejects.toThrow("redirect:/seller");
    expect(set).toHaveBeenCalledWith(MODE_COOKIE, "selling", expect.objectContaining({ path: "/", httpOnly: true }));
  });

  it("remembers Buying and opens the home page", async () => {
    await expect(switchMode(form("buying"))).rejects.toThrow("redirect:/");
    expect(set).toHaveBeenCalledWith(MODE_COOKIE, "buying", expect.any(Object));
  });

  it("treats anything else as Buying", async () => {
    await expect(switchMode(form("admin"))).rejects.toThrow("redirect:/");
    expect(set).toHaveBeenCalledWith(MODE_COOKIE, "buying", expect.any(Object));
  });
});

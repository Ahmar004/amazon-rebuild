import { beforeEach, describe, expect, it, vi } from "vitest";

const user = { id: "user-1", email: "a@b.c", name: "Robin Tester", firstName: "Robin" };
const currentUser = vi.fn(async (): Promise<typeof user | null> => user);

const wishlistData = {
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  getWishlistAsins: vi.fn(),
};

vi.mock("@/lib/data/wishlist", () => wishlistData);
vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: currentUser }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { setWishlisted, fetchWishlistAsins } = await import("@/actions/wishlist");

describe("setWishlisted", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser.mockResolvedValue(user);
    wishlistData.getWishlistAsins.mockResolvedValue(["B1", "B2"]);
  });

  it("adds for the signed-in user and returns the new count", async () => {
    const result = await setWishlisted("B000TEST01", true);
    expect(wishlistData.addToWishlist).toHaveBeenCalledWith("user-1", "B000TEST01");
    expect(result).toEqual({ ok: true, count: 2 });
  });

  it("removes for the signed-in user", async () => {
    await setWishlisted("B000TEST01", false);
    expect(wishlistData.removeFromWishlist).toHaveBeenCalledWith("user-1", "B000TEST01");
    expect(wishlistData.addToWishlist).not.toHaveBeenCalled();
  });

  it("rejects a malformed ASIN without touching the data layer", async () => {
    const result = await setWishlisted("", true);
    expect(result.ok).toBe(false);
    expect(wishlistData.addToWishlist).not.toHaveBeenCalled();
  });

  it("refuses a signed-out visitor", async () => {
    currentUser.mockResolvedValue(null);
    const result = await setWishlisted("B000TEST01", true);
    expect(result.ok).toBe(false);
    expect(wishlistData.addToWishlist).not.toHaveBeenCalled();
  });

  it("reports a data-layer failure so the client can roll back", async () => {
    wishlistData.addToWishlist.mockRejectedValueOnce(new Error("db down"));
    const result = await setWishlisted("B000TEST01", true);
    expect(result.ok).toBe(false);
  });
});

describe("fetchWishlistAsins", () => {
  it("returns the signed-in user's ASINs, or none when signed out", async () => {
    currentUser.mockResolvedValue(user);
    wishlistData.getWishlistAsins.mockResolvedValue(["B1"]);
    expect(await fetchWishlistAsins()).toEqual(["B1"]);
    currentUser.mockResolvedValue(null);
    expect(await fetchWishlistAsins()).toEqual([]);
  });
});

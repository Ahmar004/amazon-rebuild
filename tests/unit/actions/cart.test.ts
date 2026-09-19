import { beforeEach, describe, expect, it, vi } from "vitest";

const owner = { guestToken: "guest-1" };

const cartData = {
  addItem: vi.fn(),
  setQuantity: vi.fn(),
  removeItem: vi.fn(),
  setSaved: vi.fn(),
  cartCount: vi.fn(),
  MAX_CART_QUANTITY: 30,
};

vi.mock("@/lib/data/cart", () => cartData);
vi.mock("@/lib/cart-owner", () => ({
  getCartOwnerOrCreate: vi.fn(async () => owner),
  getCartOwner: vi.fn(async () => owner),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

const { addToCart, updateQuantity, deleteItem, saveForLater, moveToCart } = await import("@/actions/cart");

describe("addToCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a malformed input without touching the data layer", async () => {
    const result = await addToCart({ asin: "", quantity: 1, redirectTo: "none" });
    expect(result).toEqual({ ok: false, error: expect.any(String) });
    expect(cartData.addItem).not.toHaveBeenCalled();
  });

  it("rejects a quantity over the cap", async () => {
    const result = await addToCart({ asin: "B000TEST01", quantity: 31, redirectTo: "none" });
    expect(result.ok).toBe(false);
    expect(cartData.addItem).not.toHaveBeenCalled();
  });

  it("adds the item and returns the new count for redirectTo none", async () => {
    cartData.addItem.mockResolvedValue(undefined);
    cartData.cartCount.mockResolvedValue(3);

    const result = await addToCart({ asin: "B000TEST01", quantity: 2, redirectTo: "none" });

    expect(cartData.addItem).toHaveBeenCalledWith(owner, "B000TEST01", 2);
    expect(result).toEqual({ ok: true, count: 3 });
  });

  it("redirects to the smart-wagon page for redirectTo smart-wagon", async () => {
    cartData.addItem.mockResolvedValue(undefined);

    await expect(addToCart({ asin: "B000TEST01", quantity: 1, redirectTo: "smart-wagon" })).rejects.toThrow(
      "NEXT_REDIRECT:/cart/smart-wagon?asin=B000TEST01&qty=1",
    );
  });

  it("surfaces the data layer's error message when the product is out of stock", async () => {
    cartData.addItem.mockRejectedValue(new Error("This item is currently out of stock."));

    const result = await addToCart({ asin: "B000TEST01", quantity: 1, redirectTo: "none" });

    expect(result).toEqual({ ok: false, error: "This item is currently out of stock." });
  });
});

describe("updateQuantity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a negative quantity", async () => {
    const result = await updateQuantity("B000TEST01", -1);
    expect(result.ok).toBe(false);
    expect(cartData.setQuantity).not.toHaveBeenCalled();
  });

  it("passes 0 through to delete the line", async () => {
    const result = await updateQuantity("B000TEST01", 0);
    expect(cartData.setQuantity).toHaveBeenCalledWith(owner, "B000TEST01", 0);
    expect(result).toEqual({ ok: true });
  });
});

describe("deleteItem / saveForLater / moveToCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deleteItem removes the line", async () => {
    const result = await deleteItem("B000TEST01");
    expect(cartData.removeItem).toHaveBeenCalledWith(owner, "B000TEST01");
    expect(result).toEqual({ ok: true });
  });

  it("saveForLater flags the line as saved", async () => {
    await saveForLater("B000TEST01");
    expect(cartData.setSaved).toHaveBeenCalledWith(owner, "B000TEST01", true);
  });

  it("moveToCart flags the line as not saved", async () => {
    await moveToCart("B000TEST01");
    expect(cartData.setSaved).toHaveBeenCalledWith(owner, "B000TEST01", false);
  });

  it("rejects an empty asin", async () => {
    const result = await deleteItem("");
    expect(result.ok).toBe(false);
    expect(cartData.removeItem).not.toHaveBeenCalled();
  });
});

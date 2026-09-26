import { beforeEach, describe, expect, it, vi } from "vitest";

const owner = { guestToken: "guest-1" };
const line = { asin: "B000TEST01", quantity: 2, lineTotalCents: 2000 };
const view = { lines: [line], saved: [], subtotalCents: 2000, itemCount: 2 };

const cartData = {
  addItem: vi.fn(),
  setQuantity: vi.fn(),
  removeItem: vi.fn(),
  setSaved: vi.fn(),
  getCart: vi.fn(async () => view),
  MAX_CART_QUANTITY: 30,
};

const getCartOwner = vi.fn(async (): Promise<typeof owner | null> => owner);

vi.mock("@/lib/data/cart", () => cartData);
vi.mock("@/lib/cart-owner", () => ({
  getCartOwnerOrCreate: vi.fn(async () => owner),
  getCartOwner,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { addToCart, fetchCart, updateQuantity, deleteItem, saveForLater, moveToCart } = await import("@/actions/cart");

const expectedCart = {
  lines: [line],
  subtotalCents: 2000,
  itemCount: 2,
  freeShipping: expect.objectContaining({ remainingCents: 1500, qualified: false }),
};

describe("fetchCart", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the owner's cart with the server-computed free-shipping progress", async () => {
    expect(await fetchCart()).toEqual(expectedCart);
  });

  it("returns an empty cart for a visitor with no cart yet", async () => {
    getCartOwner.mockResolvedValueOnce(null);
    const cart = await fetchCart();
    expect(cart).toMatchObject({ lines: [], itemCount: 0, subtotalCents: 0 });
    expect(cartData.getCart).not.toHaveBeenCalled();
  });
});

describe("addToCart", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a malformed input without touching the data layer", async () => {
    const result = await addToCart({ asin: "", quantity: 1 });
    expect(result).toEqual({ ok: false, error: expect.any(String) });
    expect(cartData.addItem).not.toHaveBeenCalled();
  });

  it("rejects a quantity over the cap", async () => {
    const result = await addToCart({ asin: "B000TEST01", quantity: 31 });
    expect(result.ok).toBe(false);
    expect(cartData.addItem).not.toHaveBeenCalled();
  });

  it("adds the item and returns the fresh cart", async () => {
    cartData.addItem.mockResolvedValue(undefined);
    const result = await addToCart({ asin: "B000TEST01", quantity: 2 });
    expect(cartData.addItem).toHaveBeenCalledWith(owner, "B000TEST01", 2);
    expect(result).toEqual({ ok: true, cart: expectedCart });
  });

  it("surfaces the data layer's error message when the product is out of stock", async () => {
    cartData.addItem.mockRejectedValue(new Error("This item is currently out of stock."));
    const result = await addToCart({ asin: "B000TEST01", quantity: 1 });
    expect(result).toEqual({ ok: false, error: "This item is currently out of stock." });
  });
});

describe("updateQuantity", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a negative quantity", async () => {
    const result = await updateQuantity("B000TEST01", -1);
    expect(result.ok).toBe(false);
    expect(cartData.setQuantity).not.toHaveBeenCalled();
  });

  it("passes 0 through to delete the line", async () => {
    const result = await updateQuantity("B000TEST01", 0);
    expect(cartData.setQuantity).toHaveBeenCalledWith(owner, "B000TEST01", 0);
    expect(result).toEqual({ ok: true, cart: expectedCart });
  });
});

describe("deleteItem / saveForLater / moveToCart", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deleteItem removes the line", async () => {
    const result = await deleteItem("B000TEST01");
    expect(cartData.removeItem).toHaveBeenCalledWith(owner, "B000TEST01");
    expect(result.ok).toBe(true);
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

  it("reports a failed write instead of throwing", async () => {
    cartData.setSaved.mockRejectedValueOnce(new Error("db down"));
    const result = await moveToCart("B000TEST01");
    expect(result).toEqual({ ok: false, error: "db down" });
  });
});

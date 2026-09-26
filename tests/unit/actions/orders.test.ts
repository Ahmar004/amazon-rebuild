import { beforeEach, describe, expect, it, vi } from "vitest";

const user = { id: "user-1" };
const placedAt = new Date(Date.now() - 10 * 60 * 1000);
const order = { id: "111-2222222-3333333", placedAt, deliveryDate: new Date(Date.now() + 3 * 86400000), cancelledAt: null };

const currentUser = vi.fn(async (): Promise<typeof user | null> => user);
const getOrder = vi.fn(async (): Promise<typeof order | null> => order);
const getOrderPaymentIntentId = vi.fn(async () => "pi_123");
type Outcome = { cancelled: true; asins: string[] } | { cancelled: false; reason: "not_found" | "shipped" };
// Runs the refund callback the way the real transaction does, so a failing refund fails the cancel.
const cancelOrderAndRestock = vi.fn(async (_user: string, _order: string, _now: Date, refund: () => Promise<unknown>): Promise<Outcome> => {
  await refund();
  return { cancelled: true, asins: ["B000TEST01"] };
});
const refundsCreate = vi.fn(async () => ({ id: "re_1" }));
const updateTag = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: currentUser }));
vi.mock("@/lib/data/orders", () => ({ getOrder, getOrderPaymentIntentId, cancelOrderAndRestock }));
vi.mock("@/lib/stripe", () => ({ stripe: { refunds: { create: refundsCreate } } }));
vi.mock("next/cache", () => ({ updateTag, revalidatePath: vi.fn() }));

const { cancelOrder } = await import("@/actions/orders");

describe("cancelOrder", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refunds the payment, cancels the order and refreshes the products' stock", async () => {
    expect(await cancelOrder(order.id)).toEqual({ ok: true });
    expect(refundsCreate).toHaveBeenCalledWith({ payment_intent: "pi_123" }, { idempotencyKey: `cancel-${order.id}` });
    expect(cancelOrderAndRestock).toHaveBeenCalledWith(user.id, order.id, expect.any(Date), expect.any(Function));
    expect(updateTag).toHaveBeenCalledWith("product:B000TEST01");
  });

  it("refuses when signed out", async () => {
    currentUser.mockResolvedValueOnce(null);
    expect((await cancelOrder(order.id)).ok).toBe(false);
    expect(getOrder).not.toHaveBeenCalled();
  });

  it("refuses an order that isn't the user's", async () => {
    getOrder.mockResolvedValueOnce(null);
    expect(await cancelOrder(order.id)).toEqual({ ok: false, error: "We couldn't find that order." });
    expect(refundsCreate).not.toHaveBeenCalled();
  });

  it("refuses once the order has shipped", async () => {
    getOrder.mockResolvedValueOnce({ ...order, placedAt: new Date(Date.now() - 2 * 3600000) });
    const result = await cancelOrder(order.id);
    expect(result.ok).toBe(false);
    expect(refundsCreate).not.toHaveBeenCalled();
    expect(cancelOrderAndRestock).not.toHaveBeenCalled();
  });

  it("fails the cancel when the refund fails", async () => {
    refundsCreate.mockRejectedValueOnce(new Error("stripe down"));
    expect((await cancelOrder(order.id)).ok).toBe(false);
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("refuses when a seller shipped an item in the meantime", async () => {
    cancelOrderAndRestock.mockResolvedValueOnce({ cancelled: false, reason: "shipped" });
    expect(await cancelOrder(order.id)).toEqual({ ok: false, error: "This order has already shipped, so it can no longer be cancelled." });
    expect(refundsCreate).not.toHaveBeenCalled();
  });

  it("rejects a malformed order id", async () => {
    expect((await cancelOrder("")).ok).toBe(false);
    expect(getOrder).not.toHaveBeenCalled();
  });
});

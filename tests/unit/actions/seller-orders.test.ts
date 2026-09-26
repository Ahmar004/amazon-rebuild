import { beforeEach, describe, expect, it, vi } from "vitest";

const user = { id: "11111111-1111-4111-8111-111111111111" };
const currentUser = vi.fn(async (): Promise<typeof user | null> => user);
const markSoldItem = vi.fn(async () => true);
const revalidatePath = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: currentUser }));
vi.mock("@/lib/data/seller-orders", () => ({ markSoldItem }));
vi.mock("next/cache", () => ({ revalidatePath }));

const { markShipped, markDelivered } = await import("@/actions/seller-orders");

const ORDER = "123-4567890-1234567";
const ASIN = "LABC123456";

describe("markShipped / markDelivered", () => {
  beforeEach(() => vi.clearAllMocks());

  it("moves the seller's own sold item", async () => {
    expect(await markShipped(ORDER, ASIN)).toEqual({ ok: true });
    expect(markSoldItem).toHaveBeenCalledWith(user.id, ORDER, ASIN, "shipped", expect.any(Date));
    expect(await markDelivered(ORDER, ASIN)).toEqual({ ok: true });
    expect(markSoldItem).toHaveBeenLastCalledWith(user.id, ORDER, ASIN, "delivered", expect.any(Date));
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("explains when there was nothing to move", async () => {
    markSoldItem.mockResolvedValueOnce(false);
    const result = await markShipped(ORDER, ASIN);
    expect(result.ok).toBe(false);
  });

  it("rejects malformed ids and signed-out users", async () => {
    expect((await markShipped("", ASIN)).ok).toBe(false);
    expect((await markShipped(ORDER, "'; drop")).ok).toBe(false);
    currentUser.mockResolvedValueOnce(null);
    expect((await markShipped(ORDER, ASIN)).ok).toBe(false);
    expect(markSoldItem).not.toHaveBeenCalled();
  });
});

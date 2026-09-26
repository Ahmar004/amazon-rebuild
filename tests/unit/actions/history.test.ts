import { beforeEach, describe, expect, it, vi } from "vitest";

const user = { id: "user-1", email: "a@b.c", name: "Robin Tester", firstName: "Robin" };
const currentUser = vi.fn(async (): Promise<typeof user | null> => user);
const historyData = { recordView: vi.fn(), removeFromHistory: vi.fn(), clearHistory: vi.fn() };

vi.mock("@/lib/data/history", () => historyData);
vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: currentUser }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { recordProductView, removeHistoryItem, clearBrowsingHistory } = await import("@/actions/history");

describe("history actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser.mockResolvedValue(user);
  });

  it("records a view for the signed-in user only", async () => {
    await recordProductView("B000TEST01");
    expect(historyData.recordView).toHaveBeenCalledWith("user-1", "B000TEST01");
    currentUser.mockResolvedValue(null);
    await recordProductView("B000TEST01");
    expect(historyData.recordView).toHaveBeenCalledTimes(1);
  });

  it("ignores a malformed ASIN", async () => {
    await recordProductView("");
    expect(historyData.recordView).not.toHaveBeenCalled();
  });

  it("never lets a failed history write break the product page", async () => {
    historyData.recordView.mockRejectedValueOnce(new Error("db down"));
    await expect(recordProductView("B000TEST01")).resolves.toBeUndefined();
  });

  it("removes one item and clears everything for the signed-in user", async () => {
    expect(await removeHistoryItem("B000TEST01")).toEqual({ ok: true });
    expect(historyData.removeFromHistory).toHaveBeenCalledWith("user-1", "B000TEST01");
    expect(await clearBrowsingHistory()).toEqual({ ok: true });
    expect(historyData.clearHistory).toHaveBeenCalledWith("user-1");
  });

  it("refuses removal when signed out", async () => {
    currentUser.mockResolvedValue(null);
    expect((await clearBrowsingHistory()).ok).toBe(false);
    expect(historyData.clearHistory).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const user = { id: "user-1", email: "a@b.c", name: "Robin Tester", firstName: "Robin" };
const currentUser = vi.fn(async (): Promise<typeof user | null> => user);
const createReview = vi.fn();
const updateTag = vi.fn();

class ReviewNotAllowedError extends Error {}

vi.mock("@/lib/data/reviews", () => ({ createReview, ReviewNotAllowedError }));
vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: currentUser }));
vi.mock("next/cache", () => ({ updateTag, revalidateTag: vi.fn() }));

const { submitReview } = await import("@/actions/reviews");

const input = { asin: "B000TEST01", rating: 5, title: "Great", body: "Works exactly as described." };

describe("submitReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser.mockResolvedValue(user);
  });

  it("creates a verified review under the user's display name and refreshes the product", async () => {
    const result = await submitReview(input);
    expect(result).toEqual({ ok: true });
    expect(createReview).toHaveBeenCalledWith({ userId: "user-1", authorName: "Robin T.", ...input });
    expect(updateTag).toHaveBeenCalledWith("product:B000TEST01");
  });

  it("returns field errors for invalid input without writing", async () => {
    const result = await submitReview({ ...input, body: "meh" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors?.body).toBeTruthy();
    expect(createReview).not.toHaveBeenCalled();
  });

  it("refuses a signed-out visitor", async () => {
    currentUser.mockResolvedValue(null);
    expect((await submitReview(input)).ok).toBe(false);
    expect(createReview).not.toHaveBeenCalled();
  });

  it("passes on the reason when the user may not review (not a buyer, or already reviewed)", async () => {
    createReview.mockRejectedValueOnce(new ReviewNotAllowedError("Only customers who bought this item can review it."));
    const result = await submitReview(input);
    expect(result).toEqual({ ok: false, error: "Only customers who bought this item can review it." });
  });
});

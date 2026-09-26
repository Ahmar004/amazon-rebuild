"use server";

// Review Server Action (frontend-rebuild.md C19). The author comes from the session; whether they
// may review is decided in lib/data/reviews.ts against their orders, never by the client.
import { revalidateTag, updateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createReview, ReviewNotAllowedError } from "@/lib/data/reviews";
import { reviewAuthorName, reviewInputSchema } from "@/lib/validation/review";
import { fieldErrorsOf } from "@/lib/validation/auth";

export type ReviewResult = { ok: true } | { ok: false; error?: string; fieldErrors?: Record<string, string> };

export async function submitReview(input: { asin: string; rating: number; title: string; body: string }): Promise<ReviewResult> {
  const parsed = reviewInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to write a review." };

  try {
    await createReview({ userId: user.id, authorName: reviewAuthorName(user.name), ...parsed.data });
  } catch (err) {
    if (err instanceof ReviewNotAllowedError) return { ok: false, error: err.message };
    return { ok: false, error: "Could not post your review. Please try again." };
  }

  // The shopper sees their review at once; rails and search pick up the new rating in the background.
  updateTag(`product:${parsed.data.asin}`);
  revalidateTag("products", "max");
  revalidateTag("search", "max");
  return { ok: true };
}

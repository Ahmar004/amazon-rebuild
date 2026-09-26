import { BadgeCheck, ShoppingBag } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getReviewEligibility, REVIEW_NOT_ALLOWED } from "@/lib/data/reviews";
import { ReviewForm } from "@/components/reviews/ReviewForm";

// "Review this product" under the rating histogram (frontend-rebuild.md C19). It reads the
// session, so the page renders it inside <Suspense>. The same rule is enforced again on submit.
export async function ReviewComposer({ asin }: { asin: string }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const eligibility = await getReviewEligibility(user.id, asin);

  return (
    <div className="mt-6 border-t border-border pt-4">
      <p className="text-base font-bold text-fg">Review this product</p>
      {eligibility === "eligible" ? (
        <>
          <p className="mb-3 text-sm text-fg-muted">You bought this item. Tell other shoppers what you think.</p>
          <ReviewForm asin={asin} />
        </>
      ) : (
        <p className="mt-1 flex items-start gap-2 text-sm text-fg-muted">
          {eligibility === "already-reviewed" ? (
            <BadgeCheck size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
          ) : (
            <ShoppingBag size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          )}
          {REVIEW_NOT_ALLOWED[eligibility]}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, inputClass } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useReviewForm } from "@/hooks/useReviewForm";
import { REVIEW_LIMITS } from "@/lib/constants/reviews";

const STARS = [1, 2, 3, 4, 5] as const;
const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

// The write-a-review form, shown only to buyers who have not reviewed yet (ReviewComposer).
// Enter in the headline submits; Esc anywhere in the form collapses it.
export function ReviewForm({ asin }: { asin: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const { pending, onSubmit, error, fieldErrors } = useReviewForm(asin, () => toast("Thanks, your review is live."));

  if (!open) {
    return (
      <Button variant="secondary" full onClick={() => setOpen(true)}>
        Write a review
      </Button>
    );
  }

  const shown = hover || rating;
  return (
    <form onSubmit={onSubmit} onKeyDown={(e) => e.key === "Escape" && setOpen(false)} className="space-y-3" noValidate>
      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-fg">Your rating</legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {STARS.map((n) => (
            <label key={n} onMouseEnter={() => setHover(n)} className="cursor-pointer rounded p-0.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent">
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="sr-only" />
              <Star size={26} aria-hidden="true" className={`transition ${n <= shown ? "fill-star text-star" : "text-border-strong"}`} />
              <span className="sr-only">
                {n} {n === 1 ? "star" : "stars"}
              </span>
            </label>
          ))}
          <span className="ml-2 text-sm text-fg-muted">{STAR_LABELS[shown]}</span>
        </div>
        {fieldErrors.rating && <p className="mt-1 text-xs text-danger">{fieldErrors.rating}</p>}
      </fieldset>

      <Input label="Headline" name="title" maxLength={REVIEW_LIMITS.titleMax} placeholder="What stood out?" error={fieldErrors.title} />

      <div>
        <label htmlFor="review-body" className="mb-1 block text-sm font-semibold text-fg">
          Your review
        </label>
        <textarea
          id="review-body"
          name="body"
          rows={5}
          maxLength={REVIEW_LIMITS.bodyMax}
          placeholder="What did you like or dislike? How did you use it?"
          aria-invalid={fieldErrors.body ? true : undefined}
          className={`${inputClass} h-auto py-2`}
        />
        {fieldErrors.body && <p className="mt-1 text-xs text-danger">{fieldErrors.body}</p>}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Posting..." : "Post review"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

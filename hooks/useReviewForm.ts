"use client";

import { useState, useTransition, type FormEvent } from "react";
import { submitReview, type ReviewResult } from "@/actions/reviews";

// Submit logic for the review form: reads the fields, calls the Server Action and keeps errors.
// On success the action refreshes the product, so the page re-renders with the new review.
export function useReviewForm(asin: string, onSuccess: () => void) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ReviewResult | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setResult(null);
    startTransition(async () => {
      const outcome = await submitReview({
        asin,
        rating: Number(form.get("rating") ?? 0),
        title: String(form.get("title") ?? ""),
        body: String(form.get("body") ?? ""),
      });
      setResult(outcome);
      if (outcome.ok) onSuccess();
    });
  }

  const failed = result && !result.ok ? result : null;
  return { pending, onSubmit, error: failed?.error, fieldErrors: failed?.fieldErrors ?? {} };
}

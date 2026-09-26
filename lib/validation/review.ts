import { z } from "zod";
import { asinSchema } from "@/lib/validation/cart";
import { REVIEW_LIMITS } from "@/lib/constants/reviews";

// Input rules for a customer review (frontend-rebuild.md C19). Who may review is checked in the
// data layer against the user's orders; this only bounds the shape.
export const reviewInputSchema = z.object({
  asin: asinSchema,
  rating: z.coerce.number().int().min(1, "Choose a star rating.").max(5, "Choose a star rating."),
  title: z.string().trim().min(1, "Add a headline.").max(REVIEW_LIMITS.titleMax, `Keep the headline under ${REVIEW_LIMITS.titleMax} characters.`),
  body: z
    .string()
    .trim()
    .min(REVIEW_LIMITS.bodyMin, `Write at least ${REVIEW_LIMITS.bodyMin} characters.`)
    .max(REVIEW_LIMITS.bodyMax, `Keep the review under ${REVIEW_LIMITS.bodyMax} characters.`),
});
export type ReviewInput = z.infer<typeof reviewInputSchema>;

function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// "Robin Tester" -> "Robin T.": recognisable without publishing a shopper's full name.
export function reviewAuthorName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Shopeedo customer";
  const first = capitalise(parts[0]);
  return parts.length === 1 ? first : `${first} ${parts.at(-1)!.charAt(0).toUpperCase()}.`;
}

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

// Review authors show their public name (lib/users/public-name.ts).
export { publicName as reviewAuthorName } from "@/lib/users/public-name";

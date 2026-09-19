// Zod schema for actions/addresses.ts's upsertAddress and components/checkout/AddressModal
// (docs/design.md 6.7: "the Zod addressSchema (5-digit ZIP, 2-letter state from the UsState
// list, phone of 10 or more digits)").
import { z } from "zod";
import { isUsState } from "@/lib/constants/us-states";

const PHONE_DIGITS_MIN = 10;

export const addressSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().trim().min(1, "Enter a full name"),
  phone: z
    .string()
    .trim()
    .min(1, "Enter a phone number")
    .refine((value) => value.replace(/\D/g, "").length >= PHONE_DIGITS_MIN, "Enter a valid phone number"),
  line1: z.string().trim().min(1, "Enter a street address"),
  line2: z.string().trim().optional().default(""),
  city: z.string().trim().min(1, "Enter a city"),
  state: z.string().refine(isUsState, "Select a state"),
  zip: z.string().trim().regex(/^\d{5}$/, "Enter a valid ZIP code"),
  instructions: z.string().trim().optional().default(""),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

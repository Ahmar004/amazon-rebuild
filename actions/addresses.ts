"use server";

// Server Action behind AddressModal (docs/design.md 6.7). Validates with the shared addressSchema
// and always writes under the signed-in user's id (requireUser), never a client-supplied one.
import { requireUser } from "@/lib/auth/current-user";
import { upsertAddress as upsertAddressRow, type Address } from "@/lib/data/addresses";
import { addressSchema } from "@/lib/validation/address";
import { ROUTES } from "@/lib/constants/links";

const GENERIC_ERROR = "Please check the highlighted fields.";

export type UpsertAddressResult = { ok: true; address: Address } | { ok: false; error: string };

export async function upsertAddress(input: unknown): Promise<UpsertAddressResult> {
  const user = await requireUser(ROUTES.checkout);

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };

  const address = await upsertAddressRow(user.id, parsed.data);
  return { ok: true, address };
}

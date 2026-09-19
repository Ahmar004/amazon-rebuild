"use client";

import { Children, cloneElement, isValidElement, useId, useState, type FormEvent, type ReactElement } from "react";
import { Modal } from "@/components/ui/Modal";
import { upsertAddress } from "@/actions/addresses";
import { addressSchema } from "@/lib/validation/address";
import { US_STATES } from "@/lib/constants/us-states";
import type { Address } from "@/lib/data/addresses";

type AddressModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: (address: Address) => void;
  /** Editing an existing address pre-fills the form; omitted for "Add a new delivery address". */
  address?: Address | null;
};

type FieldErrors = Partial<Record<"fullName" | "phone" | "line1" | "city" | "state" | "zip", string>>;

// The address form (docs/spec.md 5.8, recon 6-checkout-page-address-popup.png): Country/Region
// fixed to United States, then the fields the schema validates. "Autofill your current location"
// is omitted per the plan (needs geolocation plus reverse geocoding, out of scope).
export function AddressModal({ open, onClose, onSaved, address }: AddressModalProps) {
  const titleId = useId();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  function handleClose() {
    setErrors({});
    setFormError(null);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const input = {
      id: address?.id,
      fullName: String(formData.get("fullName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      line1: String(formData.get("line1") ?? ""),
      line2: String(formData.get("line2") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      zip: String(formData.get("zip") ?? ""),
      instructions: String(formData.get("instructions") ?? ""),
      isDefault: formData.get("isDefault") === "on",
    };

    const parsed = addressSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setFormError(null);
    setPending(true);
    const result = await upsertAddress(parsed.data);
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    onSaved(result.address);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={address ? "Edit address" : "Add an address"}
      labelledBy={titleId}
      widthClassName="max-w-lg"
    >
      <h2 id={titleId} className="mb-3 text-xl font-bold text-text">
        {address ? "Edit shipping address" : "Enter a new shipping address"}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Country/Region">
          <select disabled defaultValue="US" className="h-9 w-full rounded-[3px] border border-[#a6a6a6] bg-search-dept px-2 text-base">
            <option value="US">United States</option>
          </select>
        </Field>

        <Field label="Full name (First and Last name)" error={errors.fullName}>
          <input
            name="fullName"
            defaultValue={address?.fullName}
            className={inputClass(errors.fullName)}
            autoComplete="name"
          />
        </Field>

        <Field label="Phone number" error={errors.phone} hint={!errors.phone ? "May be used to assist delivery" : undefined}>
          <input
            name="phone"
            defaultValue={address?.phone}
            className={inputClass(errors.phone)}
            autoComplete="tel"
          />
        </Field>

        <Field label="Street address" error={errors.line1}>
          <input
            name="line1"
            defaultValue={address?.line1}
            placeholder="Street address or P.O. Box"
            className={inputClass(errors.line1)}
            autoComplete="address-line1"
          />
        </Field>

        <Field label="Unit or suite number">
          <input
            name="line2"
            defaultValue={address?.line2 ?? ""}
            placeholder="Apt, suite, unit, building, floor, etc."
            className={inputClass()}
            autoComplete="address-line2"
          />
        </Field>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <Field label="City" error={errors.city} className="mb-0">
            <input name="city" defaultValue={address?.city} className={inputClass(errors.city)} autoComplete="address-level2" />
          </Field>
          <Field label="State" error={errors.state} className="mb-0">
            <select name="state" defaultValue={address?.state ?? ""} className={inputClass(errors.state)}>
              <option value="" disabled>
                Select
              </option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ZIP Code" error={errors.zip} className="mb-0">
            <input name="zip" defaultValue={address?.zip} className={inputClass(errors.zip)} autoComplete="postal-code" inputMode="numeric" />
          </Field>
        </div>

        <label className="mb-3 flex items-center gap-2 text-sm text-text">
          <input type="checkbox" name="isDefault" defaultChecked={address?.isDefault ?? false} />
          Make this my default address
        </label>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setInstructionsOpen((v) => !v)}
            className="text-sm font-bold text-link hover:text-link-hover hover:underline"
          >
            Delivery instructions (optional) {instructionsOpen ? "−" : "+"}
          </button>
          {instructionsOpen && (
            <textarea
              name="instructions"
              defaultValue={address?.instructions ?? ""}
              placeholder="Add preferences, notes, access codes and more"
              className="mt-2 w-full rounded-[3px] border border-[#a6a6a6] p-2 text-sm outline-none focus-visible:border-[#e77600] focus-visible:ring-[3px] focus-visible:ring-[#e77600]/40"
              rows={2}
            />
          )}
        </div>

        {formError && (
          <p role="alert" className="mb-3 text-sm text-error">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-full border border-btn-yellow-border bg-btn-yellow px-6 text-sm font-bold text-text hover:bg-btn-yellow-hover disabled:opacity-60"
        >
          {pending ? "Saving..." : "Use this address"}
        </button>
      </form>
    </Modal>
  );
}

function inputClass(error?: string): string {
  return `h-9 w-full rounded-[3px] border px-2 text-base outline-none focus-visible:border-[#e77600] focus-visible:ring-[3px] focus-visible:ring-[#e77600]/40 ${
    error ? "border-error" : "border-[#a6a6a6]"
  }`;
}

function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  const child = Children.only(children);
  const withId = isValidElement(child)
    ? cloneElement(child as ReactElement<{ id?: string }>, { id })
    : child;

  return (
    <div className={`mb-3 ${className ?? ""}`}>
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-text">
        {label}
      </label>
      {withId}
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

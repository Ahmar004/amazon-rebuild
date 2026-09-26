"use client";

import { useState } from "react";
import type { Address } from "@/lib/data/addresses";
import { CheckoutSection, choiceClass } from "@/components/checkout/CheckoutSection";

type AddressStepProps = {
  addresses: Address[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onEdit: (address: Address) => void;
};

// Section 1 of checkout: a short "Delivering to <name>" summary once an address is chosen, or the
// saved addresses as radio cards plus "Add a new address" while choosing.
export function AddressStep({ addresses, selectedId, onSelect, onAddNew, onEdit }: AddressStepProps) {
  const selected = addresses.find((a) => a.id === selectedId) ?? null;
  const [editing, setEditing] = useState(selected === null);

  if (!editing && selected) {
    return (
      <CheckoutSection step={1} title="Delivery address" done>
        <div className="flex items-start justify-between gap-3 text-sm text-fg">
          <p>
            Delivering to <span className="font-bold">{selected.fullName}</span>
            <br />
            {selected.line1}
            {selected.line2 ? `, ${selected.line2}` : ""}, {selected.city}, {selected.state} {selected.zip}
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-full border border-border-strong px-3 py-1 text-sm font-semibold text-fg hover:bg-surface-muted"
          >
            Change
          </button>
        </div>
      </CheckoutSection>
    );
  }

  return (
    <CheckoutSection step={1} title="Delivery address">
      {addresses.length === 0 && <p className="text-sm text-fg-muted">Add where your order should go. We save it for next time.</p>}

      {addresses.length > 0 && (
        <div role="radiogroup" aria-label="Delivery address" className="grid gap-2 sm:grid-cols-2">
          {addresses.map((address) => (
            <label
              key={address.id}
              className={choiceClass(selectedId === address.id)}
            >
              <input
                type="radio"
                name="address"
                className="mt-1 shrink-0 accent-[var(--color-accent)]"
                checked={selectedId === address.id}
                onChange={() => {
                  onSelect(address.id);
                  setEditing(false);
                }}
              />
              <span className="flex-1">
                <span className="font-bold">{address.fullName}</span>
                <br />
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city}, {address.state} {address.zip}
                <br />
                {address.phone}
                <br />
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    onEdit(address);
                  }}
                  className="mt-1 text-accent hover:text-accent-hover hover:underline"
                >
                  Edit address
                </button>
              </span>
            </label>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAddNew}
        className={
          addresses.length === 0
            ? "rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-fg hover:bg-accent-hover"
            : "mt-3 block text-sm font-semibold text-accent hover:text-accent-hover hover:underline"
        }
      >
        {addresses.length === 0 ? "Add a delivery address" : "+ Add a new address"}
      </button>
    </CheckoutSection>
  );
}

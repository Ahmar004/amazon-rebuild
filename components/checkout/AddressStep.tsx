"use client";

import { useState } from "react";
import type { Address } from "@/lib/data/addresses";

type AddressStepProps = {
  addresses: Address[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onEdit: (address: Address) => void;
};

// Step 1 of checkout (docs/spec.md 5.8): a collapsed "Delivering to <name>" summary once an
// address is chosen, or the radio list of saved addresses plus "Add a new delivery address"
// while choosing (recon 6-we-reach-checkout-page-after-email-verification...).
export function AddressStep({ addresses, selectedId, onSelect, onAddNew, onEdit }: AddressStepProps) {
  const selected = addresses.find((a) => a.id === selectedId) ?? null;
  const [editing, setEditing] = useState(selected === null);

  if (!editing && selected) {
    return (
      <section className="rounded-lg bg-white p-4">
        <h2 className="text-lg font-bold text-text">Delivery address</h2>
        <p className="mt-2 text-sm text-text">
          Delivering to <span className="font-bold">{selected.fullName}</span>
        </p>
        <p className="text-sm text-text">
          {selected.line1}
          {selected.line2 ? `, ${selected.line2}` : ""}, {selected.city}, {selected.state} {selected.zip}
        </p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-2 text-sm text-link hover:text-link-hover hover:underline"
        >
          Change
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-lg bg-white p-4">
      <h2 className="text-lg font-bold text-text">{addresses.length ? "Delivery address" : "Add delivery address"}</h2>
      {addresses.length === 0 && <p className="mt-1 text-sm text-text-muted">Enter your address to see delivery options</p>}

      {addresses.length > 0 && (
        <div role="radiogroup" aria-label="Delivery address" className="mt-3 space-y-2">
          {addresses.map((address) => (
            <label
              key={address.id}
              className={`flex cursor-pointer gap-2 rounded border p-3 text-sm text-text ${
                selectedId === address.id ? "border-link" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="address"
                className="mt-1 shrink-0"
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
                  className="mt-1 text-link hover:text-link-hover hover:underline"
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
            ? "mt-3 rounded-full border border-btn-yellow-border bg-btn-yellow px-4 py-1.5 text-sm font-bold text-text hover:bg-btn-yellow-hover"
            : "mt-3 block text-sm text-link hover:text-link-hover hover:underline"
        }
      >
        Add a new delivery address
      </button>
    </section>
  );
}

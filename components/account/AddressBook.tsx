"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus } from "lucide-react";
import { makeDefaultAddress, removeAddress } from "@/actions/account";
import { AddressModal } from "@/components/checkout/AddressModal";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useAccountAction } from "@/hooks/useAccountAction";
import type { Address } from "@/lib/data/addresses";

const LINK = "text-sm font-semibold text-accent hover:underline disabled:opacity-50";

// The Addresses tab: an "Add address" tile, then each saved address with Edit, Remove (two steps)
// and Set as default. Uses the same form as checkout.
export function AddressBook({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const toast = useToast();
  const { pending, run } = useAccountAction();
  const [editing, setEditing] = useState<Address | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function open(address: Address | null) {
    setEditing(address);
    setModalOpen(true);
  }

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li>
          <button
            type="button"
            onClick={() => open(null)}
            className="flex h-full min-h-[190px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-strong text-fg-muted transition hover:border-accent hover:text-accent"
          >
            <Plus size={28} aria-hidden="true" />
            <span className="font-semibold">Add address</span>
          </button>
        </li>
        {addresses.map((address) => (
          <li key={address.id} className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <p className="flex items-center gap-1.5 font-bold text-fg">
                <MapPin size={15} aria-hidden="true" />
                {address.fullName}
              </p>
              {address.isDefault && <Badge>Default</Badge>}
            </div>
            <p className="mt-2 flex-1 text-sm text-fg">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.city}, {address.state} {address.zip}
              <br />
              <span className="text-fg-muted">Phone: {address.phone}</span>
            </p>
            {confirmingId === address.id ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="text-fg">Remove this address?</span>
                <button type="button" disabled={pending} onClick={() => run(() => removeAddress(address.id), "Address removed")} className="font-semibold text-danger hover:underline">
                  Remove
                </button>
                <button type="button" onClick={() => setConfirmingId(null)} className={LINK}>
                  Keep
                </button>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-4">
                <button type="button" onClick={() => open(address)} className={LINK}>
                  Edit
                </button>
                <button type="button" onClick={() => setConfirmingId(address.id)} className={LINK}>
                  Remove
                </button>
                {!address.isDefault && (
                  <button type="button" disabled={pending} onClick={() => run(() => makeDefaultAddress(address.id), "Default address updated")} className={LINK}>
                    Set as default
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      <AddressModal
        open={modalOpen}
        address={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          toast(editing ? "Address updated" : "Address added");
          router.refresh();
        }}
      />
    </>
  );
}

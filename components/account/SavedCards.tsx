"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { makeDefaultCard, removeCard } from "@/actions/account";
import { Badge } from "@/components/ui/Badge";
import { useAccountAction } from "@/hooks/useAccountAction";
import type { PaymentMethod } from "@/lib/data/payments";

const LINK = "text-sm font-semibold text-accent hover:underline disabled:opacity-50";

// The Payment methods tab. Cards are added at checkout ("Save this card"), where Stripe already
// collects them, so this tab manages the saved ones: default and remove.
export function SavedCards({ cards }: { cards: PaymentMethod[] }) {
  const { pending, run } = useAccountAction();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-8 text-center shadow-card">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <CreditCard size={26} aria-hidden="true" />
        </span>
        <p className="font-semibold text-fg">No saved cards yet</p>
        <p className="max-w-sm text-sm text-fg-muted">Tick &quot;Save this card for future purchases&quot; at checkout and it shows up here for one-click payment next time.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <li key={card.id} className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-2 font-bold text-fg">
              <CreditCard size={18} aria-hidden="true" />
              <span className="capitalize">{card.brand}</span> ending in {card.last4}
            </p>
            {card.isDefault && <Badge>Default</Badge>}
          </div>
          <p className="mt-2 text-sm text-fg-muted">
            {card.nameOnCard} &middot; Expires {String(card.expMonth).padStart(2, "0")}/{card.expYear}
          </p>
          {confirmingId === card.id ? (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-fg">Remove this card?</span>
              <button type="button" disabled={pending} onClick={() => run(() => removeCard(card.id), "Card removed")} className="font-semibold text-danger hover:underline">
                Remove
              </button>
              <button type="button" onClick={() => setConfirmingId(null)} className={LINK}>
                Keep
              </button>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-4">
              <button type="button" onClick={() => setConfirmingId(card.id)} className={LINK}>
                Remove
              </button>
              {!card.isDefault && (
                <button type="button" disabled={pending} onClick={() => run(() => makeDefaultCard(card.id), "Default card updated")} className={LINK}>
                  Set as default
                </button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronDown, Package, ShoppingBag, Store } from "lucide-react";
import { Popover } from "@/components/ui/Popover";
import { ORDERS_MENU } from "@/lib/constants/links";

const ICONS = [ShoppingBag, Store];

// The header's Orders button (D4): a drop-down with the Buyer side (what you ordered) and the
// Seller side (what you sold), in either mode.
export function OrdersMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative hidden lg:block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-fg hover:bg-surface-muted"
      >
        <Package size={20} aria-hidden="true" />
        Orders
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <Popover open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} anchorClassName="right-0" align="right" className="w-60 p-1.5 animate-[fade-in_150ms_ease-out]">
        <ul>
          {ORDERS_MENU.map((item, index) => {
            const Icon = ICONS[index];
            return (
              <li key={item.label}>
                <Link href={item.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-muted">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-fg">{item.label}</span>
                    <span className="block text-xs text-fg-muted">{item.description}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Popover>
    </div>
  );
}

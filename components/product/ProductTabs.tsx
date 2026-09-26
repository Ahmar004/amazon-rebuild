"use client";

import { useSyncExternalStore, type ReactNode } from "react";

export const PRODUCT_TABS = [
  { id: "overview", label: "Overview" },
  { id: "specs", label: "Specs" },
  { id: "reviews", label: "Reviews" },
] as const;

export type ProductTabId = (typeof PRODUCT_TABS)[number]["id"];

const TABS_ANCHOR = "product-tabs";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("hashchange", listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("hashchange", listener);
    window.removeEventListener("popstate", listener);
  };
}

function hashTab(): ProductTabId {
  const hash = window.location.hash.slice(1);
  return PRODUCT_TABS.some((t) => t.id === hash) ? (hash as ProductTabId) : "overview";
}

// Selects a tab by writing it to the URL hash, so review filter links (?star=5#reviews) and a
// reload land on the same tab. replaceState fires no event, so listeners are told directly.
export function selectProductTab(id: ProductTabId, scroll = false) {
  history.replaceState(history.state, "", `${window.location.pathname}${window.location.search}#${id}`);
  listeners.forEach((l) => l());
  if (scroll) document.getElementById(TABS_ANCHOR)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type ProductTabsProps = { panels: Record<ProductTabId, ReactNode>; reviewCount: number };

// Overview / Specs / Reviews (frontend-rebuild.md C10). All three panels are server-rendered;
// the tabs only choose which one shows.
export function ProductTabs({ panels, reviewCount }: ProductTabsProps) {
  const active = useSyncExternalStore(subscribe, hashTab, () => "overview" as ProductTabId);

  return (
    <section id={TABS_ANCHOR} className="scroll-mt-32">
      <div role="tablist" aria-label="Product details" className="flex gap-1 border-b border-border">
        {PRODUCT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => selectProductTab(tab.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              active === tab.id ? "border-accent text-accent" : "border-transparent text-fg-muted hover:text-fg"
            }`}
          >
            {tab.label}
            {tab.id === "reviews" && reviewCount > 0 && (
              <span className="ml-1.5 rounded-full bg-surface-muted px-1.5 py-0.5 text-xs text-fg-muted">{reviewCount.toLocaleString("en-US")}</span>
            )}
          </button>
        ))}
      </div>
      {PRODUCT_TABS.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== tab.id}
          className="animate-[fade-in_250ms_ease-out] pt-5"
        >
          {panels[tab.id]}
        </div>
      ))}
    </section>
  );
}

// "4.5 stars, 1,234 ratings" under the title: opens the Reviews tab and scrolls to it.
export function ReviewsTabLink({ children }: { children: ReactNode }) {
  return (
    <button type="button" onClick={() => selectProductTab("reviews", true)} className="flex items-center gap-1.5 text-sm hover:underline">
      {children}
    </button>
  );
}

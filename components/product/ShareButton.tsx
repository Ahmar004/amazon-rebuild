"use client";

import { useState } from "react";

const COPIED_TOOLTIP_MS = 1500;

type ShareButtonProps = {
  /** Path to share instead of the current page, e.g. a cart line's product page. */
  path?: string;
};

// Copies a product URL and shows a small "Copied" tooltip (docs/spec.md 5.5: "a share
// button that copies the link"). Defaults to the current page (the product page's own Gallery);
// components/cart/CartLine.tsx passes `path` to share the product it's showing instead.
export function ShareButton({ path }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      const url = path ? `${window.location.origin}${path}` : window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_TOOLTIP_MS);
    } catch {
      // Clipboard access can be denied (e.g. an insecure context); fail silently rather than crash.
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-label="Share"
        className="rounded p-1 text-fg hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8.6 10.5 15.4 6.5M8.6 13.5 15.4 17.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {copied && (
        <div
          role="status"
          className="absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded border border-border bg-surface px-2 py-1 text-xs text-fg shadow"
        >
          Copied
        </div>
      )}
    </div>
  );
}

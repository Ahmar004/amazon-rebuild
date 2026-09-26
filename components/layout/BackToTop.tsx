"use client";

import { ArrowUp } from "lucide-react";

// Full-width bar at the top of the footer that smooth-scrolls the page back to the top.
export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="flex h-11 w-full items-center justify-center gap-2 border-b border-border text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
    >
      <ArrowUp size={16} aria-hidden="true" />
      Back to top
    </button>
  );
}

// Underlined tab styling shared by the product tabs, the buyer's orders tabs and the seller's
// orders tabs. The accent underline grows out from the centre when a tab becomes active
// (point 18); the tab bar itself draws the grey baseline (border-b).
export function tabClass(active: boolean, className = ""): string {
  return [
    "relative shrink-0 text-sm font-semibold transition-colors",
    "after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent after:transition-transform after:duration-300 after:ease-out",
    active ? "text-fg after:scale-x-100" : "text-fg-muted after:scale-x-0 hover:text-fg",
    className,
  ].join(" ");
}

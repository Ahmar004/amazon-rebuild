// Shared hover/focus styling for a top-level header item (logo, deliver-to, returns & orders):
// transparent border that turns white on hover, visible focus ring. Extracted from Header.tsx
// so DeliverToButton (Task 3) doesn't duplicate the string. Deliberately excludes `flex`/
// flex-direction - callers add their own (`flex flex-col ...` for a stacked item like Returns,
// `flex items-start gap-1` for an icon-plus-text item like DeliverToButton) so the two never
// fight over the same utility.
export const navItemClass =
  "rounded-sm border border-transparent px-[9px] py-1 text-white hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

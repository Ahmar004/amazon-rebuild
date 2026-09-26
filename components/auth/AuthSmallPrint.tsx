import { DEMO_NOTICE } from "@/components/layout/SafetyNotice";

// Small print under the identify step's Continue button.
export function AuthSmallPrint() {
  return <p className="mt-3 text-xs text-fg-muted">{DEMO_NOTICE}</p>;
}

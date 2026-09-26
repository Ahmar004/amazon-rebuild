"use client";

import { useRecordView } from "@/hooks/useRecordView";

// Invisible: adds the product to the shopper's browsing history.
export function ViewTracker({ asin }: { asin: string }) {
  useRecordView(asin);
  return null;
}

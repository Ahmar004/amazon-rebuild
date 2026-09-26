"use client";

import { useEffect } from "react";
import { recordProductView } from "@/actions/history";

// Records one product view per page visit, after render, so the cached product page never waits
// on a database write.
export function useRecordView(asin: string) {
  useEffect(() => {
    recordProductView(asin).catch(() => {});
  }, [asin]);
}

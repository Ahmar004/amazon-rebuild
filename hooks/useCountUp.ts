"use client";

import { useEffect, useState } from "react";
import { countUpValue } from "@/lib/motion/count-up";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Counts from 0 up to `target` over `durationMs` once mounted (seller dashboard tiles, point 18).
// Shows the target straight away when the shopper asked for less motion.
export function useCountUp(target: number, durationMs = 900): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const elapsed = now - start;
      setValue(countUpValue(target, elapsed, durationMs));
      if (elapsed < durationMs) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, reduced]);

  return reduced ? target : value;
}

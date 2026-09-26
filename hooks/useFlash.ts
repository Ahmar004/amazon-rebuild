"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// A flag that turns itself off after `durationMs`, for short-lived confirmations such as a button
// reading "Added" after a successful add to cart (point 18). Calling flash() again restarts it.
export function useFlash(durationMs = 1600): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setOn(true);
    timer.current = setTimeout(() => setOn(false), durationMs);
  }, [durationMs]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return [on, flash];
}

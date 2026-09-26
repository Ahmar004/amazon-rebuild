// Value shown by a number that counts up to `target` (seller dashboard tiles, point 18). It eases
// out (cubic), so it moves fast at first and settles on the target, and it always returns a whole
// number, because the targets are cents or counts.
export function countUpValue(target: number, elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0 || elapsedMs >= durationMs) return target;
  const progress = Math.max(0, elapsedMs) / durationMs;
  const eased = 1 - (1 - progress) ** 3;
  return Math.min(target, Math.round(target * eased));
}

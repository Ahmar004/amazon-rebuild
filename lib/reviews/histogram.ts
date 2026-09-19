// Star counts are always ordered [1-star, 2-star, 3-star, 4-star, 5-star].
export type StarCounts = [number, number, number, number, number];
export type StarPercents = Record<1 | 2 | 3 | 4 | 5, number>;

const STARS = [1, 2, 3, 4, 5] as const;

export function totalRatings(counts: readonly number[]): number {
  return counts.reduce((sum, n) => sum + n, 0);
}

export function averageRating(counts: readonly number[]): number {
  const total = totalRatings(counts);
  if (total === 0) return 0;
  const weighted = counts.reduce((sum, n, i) => sum + n * (i + 1), 0);
  return Math.round((weighted / total) * 10) / 10;
}

// Splits `total` into whole numbers proportional to `weights` (largest-remainder method),
// so the parts always add up to exactly `total`.
function apportion(weights: readonly number[], total: number): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  const exact = weights.map((w) => (sum === 0 ? 0 : (w / sum) * total));
  const parts = exact.map(Math.floor);
  let left = total - parts.reduce((a, b) => a + b, 0);
  const order = exact.map((x, i) => ({ i, rest: x - Math.floor(x) })).sort((a, b) => b.rest - a.rest || b.i - a.i);
  for (const { i } of order) {
    if (left <= 0) break;
    parts[i] += 1;
    left -= 1;
  }
  return parts;
}

// The dataset gives only an average and a count. This derives the most even star spread
// (maximum-entropy distribution) whose mean equals that average: p(k) is proportional to exp(b*k),
// with b found by bisection because the mean rises monotonically with b.
export function histogramFromAverage(average: number, count: number): StarCounts {
  if (count <= 0) return [0, 0, 0, 0, 0];
  const target = Math.min(5, Math.max(1, average));
  const weightsFor = (b: number) => STARS.map((k) => Math.exp(b * k));
  const meanFor = (b: number) => {
    const w = weightsFor(b);
    return w.reduce((sum, x, i) => sum + x * (i + 1), 0) / w.reduce((a, x) => a + x, 0);
  };
  let lo = -30;
  let hi = 30;
  for (let step = 0; step < 100; step++) {
    const mid = (lo + hi) / 2;
    if (meanFor(mid) < target) lo = mid;
    else hi = mid;
  }
  return apportion(weightsFor((lo + hi) / 2), count) as StarCounts;
}

export function histogramPercents(counts: readonly number[]): StarPercents {
  const pct = totalRatings(counts) === 0 ? [0, 0, 0, 0, 0] : apportion(counts, 100);
  return { 1: pct[0], 2: pct[1], 3: pct[2], 4: pct[3], 5: pct[4] };
}

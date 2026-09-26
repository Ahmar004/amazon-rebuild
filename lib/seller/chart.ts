// Pure helpers for the seller dashboard charts, kept apart so they are testable without a browser.

export type DayTotal = { day: string; cents: number; units: number };

// Axis ticks 0, top/2, top, where top is the smallest 1, 2 or 5 x 10^n at or above max.
export function niceTicks(max: number): [number, number, number] {
  if (max <= 0) return [0, 1, 2];
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const top = [1, 2, 5, 10].map((step) => step * magnitude).find((value) => value >= max) ?? 10 * magnitude;
  return [0, top / 2, top];
}

// The last `days` UTC days ending today, oldest first, filling days without sales with zeros.
export function dailySeries(rows: DayTotal[], days: number, now: Date): DayTotal[] {
  const byDay = new Map(rows.map((row) => [row.day, row]));
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(today - (days - 1 - i) * 86_400_000).toISOString().slice(0, 10);
    return byDay.get(day) ?? { day, cents: 0, units: 0 };
  });
}

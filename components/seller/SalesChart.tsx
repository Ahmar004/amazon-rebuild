"use client";

import { useState } from "react";
import { niceTicks, type DayTotal } from "@/lib/seller/chart";
import { formatCompactPrice, formatPrice } from "@/lib/pricing/money";

const SHORT_DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const LONG_DATE = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const LABEL_EVERY = 3;

const dateOf = (day: string) => new Date(`${day}T00:00:00Z`);

// Daily sales for the last two weeks: one series, so no legend (the heading names it). Columns
// grow from a hairline baseline; hovering or focusing a day shows its total and units, the best
// day is labelled on its cap, and the same numbers are available as a table.
export function SalesChart({ days }: { days: DayTotal[] }) {
  const [active, setActive] = useState<number | null>(null);
  const maxCents = Math.max(0, ...days.map((d) => d.cents));
  const ticks = niceTicks(maxCents / 100);
  const topCents = ticks[2] * 100;
  const best = maxCents > 0 ? days.findIndex((d) => d.cents === maxCents) : -1;

  return (
    <div>
      <div className="flex gap-2 pt-3">
        <div className="relative h-48 w-12 shrink-0 text-right text-[11px] text-fg-muted tabular-nums" aria-hidden="true">
          {ticks.map((tick, i) => (
            <span key={tick} className="absolute right-0 translate-y-1/2" style={{ bottom: `${i * 50}%` }}>
              {formatCompactPrice(tick * 100)}
            </span>
          ))}
        </div>
        <div className="relative h-48 flex-1">
          {[0, 50, 100].map((pos) => (
            <div key={pos} className="absolute inset-x-0 border-t border-border" style={{ bottom: `${pos}%` }} aria-hidden="true" />
          ))}
          <ol className="absolute inset-0 flex items-end" aria-label="Sales per day">
            {days.map((day, index) => {
              const height = topCents > 0 ? (day.cents / topCents) * 100 : 0;
              const label = `${LONG_DATE.format(dateOf(day.day))}: ${formatPrice(day.cents)}, ${day.units} ${day.units === 1 ? "unit" : "units"}`;
              return (
                <li key={day.day} className="relative flex h-full flex-1 justify-center">
                  <button
                    type="button"
                    aria-label={label}
                    onMouseEnter={() => setActive(index)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    className="group flex h-full w-full items-end justify-center rounded-md px-[1px] outline-offset-0 hover:bg-surface-muted/60"
                  >
                    {day.cents > 0 && (
                      <span
                        className="block w-full max-w-6 origin-bottom rounded-t-[4px] bg-chart transition-opacity animate-[grow-up_700ms_cubic-bezier(0.2,0.7,0.2,1)_both] group-hover:opacity-85"
                        style={{ height: `${height}%`, animationDelay: `${index * 35}ms` }}
                      />
                    )}
                  </button>
                  {index === best && active === null && (
                    <span className="pointer-events-none absolute whitespace-nowrap pb-1 text-[11px] font-semibold text-fg" style={{ bottom: `${height}%` }}>
                      {formatCompactPrice(day.cents)}
                    </span>
                  )}
                  {active === index && (
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-fg shadow-pop animate-[fade-in_120ms_ease-out]"
                      style={{ bottom: `calc(${height}% + 6px)` }}
                    >
                      <span className="block text-fg-muted">{LONG_DATE.format(dateOf(day.day))}</span>
                      <span className="block font-semibold">{formatPrice(day.cents)}</span>
                      <span className="block text-fg-muted">
                        {day.units} {day.units === 1 ? "unit" : "units"} sold
                      </span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          {maxCents === 0 && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-fg-muted">No sales in the last {days.length} days yet</p>
          )}
        </div>
      </div>
      <div className="ml-14 mt-1.5 flex text-[11px] text-fg-muted" aria-hidden="true">
        {days.map((day, index) => (
          <span key={day.day} className="flex flex-1 justify-center whitespace-nowrap">
            {(days.length - 1 - index) % LABEL_EVERY === 0 ? SHORT_DATE.format(dateOf(day.day)) : ""}
          </span>
        ))}
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-accent">View as table</summary>
        <table className="mt-2 w-full text-left text-xs">
          <thead className="text-fg-muted">
            <tr>
              <th className="py-1 font-semibold">Day</th>
              <th className="py-1 text-right font-semibold">Sales</th>
              <th className="py-1 text-right font-semibold">Units</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {days.map((day) => (
              <tr key={day.day} className="border-t border-border">
                <td className="py-1">{LONG_DATE.format(dateOf(day.day))}</td>
                <td className="py-1 text-right">{formatPrice(day.cents)}</td>
                <td className="py-1 text-right">{day.units}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

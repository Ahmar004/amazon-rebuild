import { discountPercent, formatPrice, splitPrice } from "@/lib/pricing/money";

type PriceProps = {
  priceCents: number;
  listPriceCents: number | null;
  /** "compact" drops the discount label (cards show it as a badge) and shortens the list price. */
  variant?: "default" | "compact";
  /** "lg" for the product page's purchase panel. */
  size?: "md" | "lg";
};

// The price block: superscript "$", large whole number, superscript cents, then the
// struck-through list price and a discount badge when there is one (docs/design.md 6.3).
export function Price({ priceCents, listPriceCents, variant = "default", size = "md" }: PriceProps) {
  const { whole, fraction } = splitPrice(priceCents);
  const percent = variant === "compact" ? null : discountPercent(priceCents, listPriceCents);

  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <div className="flex items-baseline text-fg">
        {percent !== null && <span className="mr-1 text-deal">-{percent}%</span>}
        <span className={`${size === "lg" ? "text-3xl font-semibold" : "text-xl"} leading-none`}>
          <sup className="relative -top-[0.9em] text-xs">$</sup>
          {whole}
          <sup className="relative -top-[0.9em] text-xs">{fraction}</sup>
        </span>
      </div>
      {listPriceCents !== null && listPriceCents > priceCents && (
        <span className="text-sm text-fg-muted">
          {variant === "default" && "List: "}
          <span className="line-through">{formatPrice(listPriceCents)}</span>
        </span>
      )}
    </div>
  );
}

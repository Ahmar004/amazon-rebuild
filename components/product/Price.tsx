import { discountPercent, formatPrice, splitPrice } from "@/lib/pricing/money";

type PriceProps = {
  priceCents: number;
  listPriceCents: number | null;
};

// Amazon's price block: superscript "$", large whole number, superscript cents, then the
// struck-through list price and a discount badge when there is one (docs/design.md 6.3).
export function Price({ priceCents, listPriceCents }: PriceProps) {
  const { whole, fraction } = splitPrice(priceCents);
  const percent = discountPercent(priceCents, listPriceCents);

  return (
    <div className="flex items-baseline gap-2">
      <div className="flex items-baseline text-text">
        {percent !== null && <span className="mr-1 text-price-deal">-{percent}%</span>}
        <span className="text-xl leading-none">
          <sup className="relative -top-[0.9em] text-xs">$</sup>
          {whole}
          <sup className="relative -top-[0.9em] text-xs">{fraction}</sup>
        </span>
      </div>
      {listPriceCents !== null && listPriceCents > priceCents && (
        <span className="text-sm text-text-muted">
          List: <span className="line-through">{formatPrice(listPriceCents)}</span>
        </span>
      )}
    </div>
  );
}

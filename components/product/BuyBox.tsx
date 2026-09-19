import { getDeliveryLocation } from "@/lib/location-server";
import { deliveryDate, formatDeliveryDate } from "@/lib/pricing/delivery";
import { formatPrice } from "@/lib/pricing/money";
import { FREE_SHIPPING_THRESHOLD_CENTS, shippingCents } from "@/lib/pricing/shipping";
import { Price } from "@/components/product/Price";
import { QuantitySelect } from "@/components/product/QuantitySelect";
import { BuyBoxLocationButton } from "@/components/product/BuyBoxLocationButton";
import { DeliveryDetailsPopover } from "@/components/product/DeliveryDetailsPopover";
import type { ProductDetail } from "@/lib/data/products";

const LOW_STOCK_THRESHOLD = 10;
const MAX_QUANTITY = 30;

type BuyBoxProps = {
  product: ProductDetail;
};

// The buy box (docs/spec.md 5.5): price, delivery dates for the visitor's chosen location,
// stock, and a quantity select. Reads the deliver_to cookie (getDeliveryLocation), so it renders
// at request time inside a <Suspense> boundary in the page, never under 'use cache'
// (CLAUDE.md's Next.js 16 caching rule). "Add to cart" and "Buy Now" arrive in Slice 5; this
// slice leaves their slot empty rather than shipping a dead button.
export async function BuyBox({ product }: BuyBoxProps) {
  const location = await getDeliveryLocation();
  const now = new Date();
  const standardEta = formatDeliveryDate(deliveryDate(now, "standard"));
  const fastEta = formatDeliveryDate(deliveryDate(now, "fast"));
  const freeShipping = product.priceCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const maxQty = Math.max(0, Math.min(product.stock, MAX_QUANTITY));

  return (
    <div className="rounded-lg border border-border p-[18px]">
      <Price priceCents={product.priceCents} listPriceCents={product.listPriceCents} />

      <div className="mt-3 text-sm text-text">
        <p>
          {freeShipping ? "FREE delivery" : `${formatPrice(shippingCents(product.priceCents, "standard"))} delivery`}{" "}
          <span className="font-bold">{standardEta}</span>. <DeliveryDetailsPopover speed="standard" />
        </p>
        <p className="mt-1">
          Or fastest delivery <span className="font-bold">{fastEta}</span>.{" "}
          <DeliveryDetailsPopover speed="fast" />
        </p>
      </div>

      <BuyBoxLocationButton location={location} />

      <hr className="my-3 border-border" />

      <StockLine stock={product.stock} />

      {product.stock > 0 && (
        <div className="mt-3">
          <QuantitySelect max={maxQty} />
        </div>
      )}

      {/* "Add to cart" (yellow) and "Buy Now" (orange) arrive in Slice 5. */}
      <div aria-hidden="true" data-slot="cart-buttons" className="mt-4 empty:hidden" />

      <dl className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-text">
        <InfoRow label="Ships from" value="Amazon.com" />
        <InfoRow label="Sold by" value="Amazon.com" />
        <InfoRow label="Returns" value="30-day refund/replacement" />
        <InfoRow label="Payment" value="Secure transaction" />
      </dl>
    </div>
  );
}

function StockLine({ stock }: { stock: number }) {
  if (stock === 0) {
    return <p className="text-base text-price-deal">Currently unavailable.</p>;
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return <p className="text-base text-price-deal">Only {stock} left in stock - order soon.</p>;
  }
  return <p className="text-lg text-in-stock">In Stock</p>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

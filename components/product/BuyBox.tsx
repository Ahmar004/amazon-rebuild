import { getDeliveryLocation } from "@/lib/location-server";
import { deliveryDate, formatDeliveryDate } from "@/lib/pricing/delivery";
import { formatPrice } from "@/lib/pricing/money";
import { FREE_SHIPPING_THRESHOLD_CENTS, shippingCents } from "@/lib/pricing/shipping";
import { BuyBoxLocationButton } from "@/components/product/BuyBoxLocationButton";
import { DeliveryDetailsPopover } from "@/components/product/DeliveryDetailsPopover";
import { AddToCartForm } from "@/components/cart/AddToCartForm";
import { WishlistHeart } from "@/components/wishlist/WishlistHeart";
import { MAX_CART_QUANTITY } from "@/lib/data/cart";
import type { ProductDetail } from "@/lib/data/products";
import { getCurrentUser } from "@/lib/auth/current-user";
import { OwnListingPanel } from "@/components/listings/OwnListingPanel";

const LOW_STOCK_THRESHOLD = 10;

type BuyBoxProps = {
  product: ProductDetail;
};

// The request-time half of the purchase panel (frontend-rebuild.md C10): delivery dates for the
// shopper's ZIP, stock, quantity, Add to cart, Buy now and the wishlist heart. It reads the
// deliver_to cookie, so the page renders it inside <Suspense>, never under 'use cache'.
export async function BuyBox({ product }: BuyBoxProps) {
  // Sellers can't buy their own listing: they get its status and an Edit link instead.
  const user = await getCurrentUser();
  if (product.sellerId && product.sellerId === user?.id) return <OwnListingPanel product={product} />;

  const location = await getDeliveryLocation();
  const seller = product.sellerName ?? "Shopeedo";
  const now = new Date();
  const standardEta = formatDeliveryDate(deliveryDate(now, "standard"));
  const fastEta = formatDeliveryDate(deliveryDate(now, "fast"));
  const freeShipping = product.priceCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const maxQty = Math.max(0, Math.min(product.stock, MAX_CART_QUANTITY));

  return (
    <div>
      <div className="rounded-lg bg-surface-muted p-3 text-sm text-fg">
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

      {product.stock > 0 && <AddToCartForm asin={product.asin} maxQuantity={maxQty} />}
      <div className="mt-2">
        <WishlistHeart asin={product.asin} variant="labeled" />
      </div>

      <dl className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-fg">
        <InfoRow label="Ships from" value={seller} />
        <InfoRow label="Sold by" value={seller} />
        <InfoRow label="Returns" value="30-day refund/replacement" />
        <InfoRow label="Payment" value="Secure transaction" />
      </dl>
    </div>
  );
}

function StockLine({ stock }: { stock: number }) {
  if (stock === 0) {
    return <p className="text-base text-deal">Currently unavailable.</p>;
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return <p className="text-base text-deal">Only {stock} left in stock - order soon.</p>;
  }
  return <p className="text-lg text-success">In Stock</p>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-fg-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

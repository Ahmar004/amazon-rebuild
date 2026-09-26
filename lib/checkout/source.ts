// Resolves which items checkout is for (docs/design.md 6.7): either the cart's non-saved lines,
// or a single Buy Now item from the `?buy=<asin>:<qty>` query string, which "skips the cart and
// opens checkout with only that product and quantity; the rest of the cart stays as it was"
// (docs/spec.md 5.8). Both paths read live stock (never the hourly product cache) so quoteCheckout
// and createPaymentIntent always see the current number.
import { getCart, MAX_CART_QUANTITY, type CartOwner } from "@/lib/data/cart";
import { getProductsByAsins } from "@/lib/data/products";

export type CheckoutSourceLine = {
  asin: string;
  title: string;
  imageUrl: string;
  unitPriceCents: number;
  quantity: number;
  /** unitPriceCents x quantity, worked out here so the summary only displays it. */
  lineTotalCents: number;
  stock: number;
};

export type CheckoutSource =
  | { kind: "cart"; lines: CheckoutSourceLine[] }
  | { kind: "buy"; buy: string; lines: CheckoutSourceLine[] };

// Pure: parses "asin:qty" into its parts, or null when malformed. Exported so its edge cases are
// unit-testable without a database.
export function parseBuyParam(raw: string | undefined | null): { asin: string; quantity: number } | null {
  if (!raw) return null;
  const separatorIndex = raw.lastIndexOf(":");
  if (separatorIndex <= 0) return null;

  const asin = raw.slice(0, separatorIndex);
  const quantity = Number(raw.slice(separatorIndex + 1));
  if (!Number.isInteger(quantity) || quantity < 1) return null;

  return { asin, quantity };
}

export async function resolveCheckoutSource(owner: CartOwner | null, buy: string | undefined): Promise<CheckoutSource> {
  const parsedBuy = parseBuyParam(buy);

  if (parsedBuy) {
    const [product] = await getProductsByAsins([parsedBuy.asin]);
    if (!product || product.stock <= 0) return { kind: "buy", buy: parsedBuy.asin, lines: [] };

    const quantity = Math.max(0, Math.min(parsedBuy.quantity, product.stock, MAX_CART_QUANTITY));
    if (quantity <= 0) return { kind: "buy", buy: parsedBuy.asin, lines: [] };

    return {
      kind: "buy",
      buy: `${parsedBuy.asin}:${quantity}`,
      lines: [
        {
          asin: product.asin,
          title: product.title,
          imageUrl: product.imageUrl,
          unitPriceCents: product.priceCents,
          quantity,
          lineTotalCents: product.priceCents * quantity,
          stock: product.stock,
        },
      ],
    };
  }

  if (!owner) return { kind: "cart", lines: [] };

  const cart = await getCart(owner);
  return {
    kind: "cart",
    lines: cart.lines.map((line) => ({
      asin: line.asin,
      title: line.title,
      imageUrl: line.imageUrl,
      unitPriceCents: line.priceCents,
      quantity: line.quantity,
      lineTotalCents: line.lineTotalCents,
      stock: line.stock,
    })),
  };
}

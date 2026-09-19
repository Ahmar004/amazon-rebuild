"use client";

import { useTransition } from "react";
import { moveToCart } from "@/actions/cart";

type MoveToCartButtonProps = {
  asin: string;
};

export function MoveToCartButton({ asin }: MoveToCartButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => void (await moveToCart(asin)))}
      className="text-link hover:text-link-hover hover:underline disabled:opacity-60"
    >
      Move to cart
    </button>
  );
}

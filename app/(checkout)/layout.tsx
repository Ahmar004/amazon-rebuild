import { Suspense } from "react";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { CartCount } from "@/components/cart/CartCount";
import { Footer } from "@/components/layout/Footer";

// Shared shell for /checkout and its thank-you page: the "Secure checkout" header with no search
// bar and the compact footer with the demo notice. CartCount reads cookies() so it renders inside
// <Suspense>, never under 'use cache' (CLAUDE.md's Next.js 16 caching rule).
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <CheckoutHeader cartLink={<Suspense fallback={null}><CartCount /></Suspense>} />
      <main className="flex-1">{children}</main>
      <Footer compact />
    </div>
  );
}

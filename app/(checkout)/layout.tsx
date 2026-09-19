import { Suspense } from "react";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { CartCount } from "@/components/cart/CartCount";
import { FooterMinimal } from "@/components/layout/FooterMinimal";

// Shared shell for /checkout and its thank-you page (docs/spec.md 5.8, docs/design.md 6.7): the
// "Secure checkout" header with no search bar, the grey page background, and the minimal footer
// with SafetyNotice. CartCount reads cookies() so it renders inside <Suspense>, never
// under 'use cache' (CLAUDE.md's Next.js 16 caching rule).
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-modal-header">
      <CheckoutHeader cartLink={<Suspense fallback={null}><CartCount /></Suspense>} />
      <main className="flex-1">{children}</main>
      <FooterMinimal />
    </div>
  );
}

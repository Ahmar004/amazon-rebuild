import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { AllMenu } from "@/components/layout/AllMenu";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { SessionGuard, UserFirstName, UserIdentity } from "@/components/layout/SessionShell";
import { CartButton } from "@/components/layout/CartLink";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { ModeBar, ModeBarFallback } from "@/components/layout/ModeBar";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import { getCategories } from "@/lib/data/categories";

// Shell for every storefront page: one fluid header, the page, and the footer (C9). Categories
// are cached catalogue data, so the layout reads them directly and passes the same list to every
// menu (point 9). The cart and wishlist load on the client (CartProvider, WishlistProvider) so
// cached pages stay cached. Anything that reads the session or cart cookie renders inside its own
// <Suspense> with a static fallback, never under 'use cache' (CLAUDE.md caching rule); the menus
// themselves sit outside Suspense so their open state never resets when a slot streams in.
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <WishlistProvider>
      <CartProvider>
      <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <SessionGuard />
      </Suspense>
      <Header
        categories={categories}
        allMenu={
          <AllMenu
            categories={categories}
            firstName={
              <Suspense fallback="there">
                <UserFirstName />
              </Suspense>
            }
          />
        }
        accountMenu={
          <AccountMenu
            firstName={
              <Suspense fallback="Account">
                <UserFirstName />
              </Suspense>
            }
            identity={
              <Suspense fallback={<span className="block h-9 animate-pulse rounded bg-surface-muted" />}>
                <UserIdentity />
              </Suspense>
            }
          />
        }
        cartLink={<CartButton />}
        modeBar={
          <Suspense fallback={<ModeBarFallback />}>
            <ModeBar />
          </Suspense>
        }
      />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
      </div>
      </CartProvider>
    </WishlistProvider>
  );
}

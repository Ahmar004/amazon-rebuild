import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { AllMenu } from "@/components/layout/AllMenu";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { SessionGuard, UserFirstName, UserIdentity } from "@/components/layout/SessionShell";
import { CartLink } from "@/components/layout/CartLink";
import { CartCount } from "@/components/cart/CartCount";
import { Footer } from "@/components/layout/Footer";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import { getDepartments } from "@/lib/data/departments";

// Shell for every storefront page: one fluid header, the page, and the footer (C9). Departments
// are cached catalogue data, so the layout reads them directly and passes the same list to every
// menu (point 9). Anything that reads the session or cart cookie renders inside its own
// <Suspense> with a static fallback, never under 'use cache' (CLAUDE.md caching rule); the menus
// themselves sit outside Suspense so their open state never resets when a slot streams in.
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const departments = await getDepartments();

  return (
    <WishlistProvider>
      <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <SessionGuard />
      </Suspense>
      <Header
        departments={departments}
        allMenu={
          <AllMenu
            departments={departments}
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
        cartLink={
          <Suspense fallback={<CartLink count={0} />}>
            <CartCount />
          </Suspense>
        }
      />
      <main className="flex-1">{children}</main>
      <Footer departments={departments} />
      </div>
    </WishlistProvider>
  );
}

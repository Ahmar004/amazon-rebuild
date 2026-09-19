import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { HeaderMobile } from "@/components/layout/HeaderMobile";
import { ScrollHideHeader } from "@/components/layout/ScrollHideHeader";
import { SubNav } from "@/components/layout/SubNav";
import { DeliverTo, DeliverToFallback } from "@/components/layout/DeliverTo";
import { CartLink } from "@/components/layout/CartLink";
import { CartCount } from "@/components/cart/CartCount";
import { Footer } from "@/components/layout/Footer";
import { FooterMobile } from "@/components/layout/FooterMobile";
import { getDepartments } from "@/lib/data/departments";

// Shell for every storefront page: header + sub-nav + page content + footer, desktop and mobile
// each as their own deliberate design (CLAUDE.md) toggled by hidden/md:flex classes inside each
// component. Departments are cached catalogue data ('use cache' in lib/data/departments.ts), so
// this layout can read them directly. DeliverTo and CartCount read cookies() (Task 3, Slice 5), so
// each instance renders inside its own <Suspense> boundary rather than blocking the rest of the shell.
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const departments = await getDepartments();

  return (
    <>
      <ScrollHideHeader>
        <Header
          departments={departments}
          deliverTo={
            <Suspense fallback={<DeliverToFallback />}>
              <DeliverTo />
            </Suspense>
          }
          cartLink={
            <Suspense fallback={<CartLink count={0} />}>
              <CartCount />
            </Suspense>
          }
        />
        <SubNav departments={departments} />

        <HeaderMobile
          departments={departments}
          deliverTo={
            <Suspense fallback={<DeliverToFallback variant="mobile" />}>
              <DeliverTo variant="mobile" />
            </Suspense>
          }
          cartLink={
            <Suspense fallback={<CartLink count={0} variant="mobile" />}>
              <CartCount variant="mobile" />
            </Suspense>
          }
        />
      </ScrollHideHeader>

      <main>{children}</main>

      <Footer />
      <FooterMobile />
    </>
  );
}

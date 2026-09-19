import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { SubNav } from "@/components/layout/SubNav";
import { DeliverTo, DeliverToFallback } from "@/components/layout/DeliverTo";
import { getDepartments } from "@/lib/data/departments";

// Shell for every storefront page: header + sub-nav + page content + footer slot. Departments
// are cached catalogue data ('use cache' in lib/data/departments.ts), so this layout can read
// them directly. DeliverTo reads cookies() (Task 3), so it renders inside its own <Suspense>
// boundary rather than blocking the rest of the shell.
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const departments = await getDepartments();

  return (
    <>
      <Header
        departments={departments}
        deliverTo={
          <Suspense fallback={<DeliverToFallback />}>
            <DeliverTo />
          </Suspense>
        }
      />
      <SubNav departments={departments} />
      <main>{children}</main>
      {/* Footer: Task 4 */}
    </>
  );
}

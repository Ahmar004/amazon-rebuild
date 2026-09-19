import { Header } from "@/components/layout/Header";
import { SubNav } from "@/components/layout/SubNav";
import { getDepartments } from "@/lib/data/departments";

// Shell for every storefront page: header + sub-nav + page content + footer slot. Departments
// are cached catalogue data ('use cache' in lib/data/departments.ts), so this layout can read
// them directly - nothing here touches cookies() or headers().
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const departments = await getDepartments();

  return (
    <>
      <Header departments={departments} deliverTo={null} />
      <SubNav departments={departments} />
      <main>{children}</main>
      {/* Footer: Task 4 */}
    </>
  );
}

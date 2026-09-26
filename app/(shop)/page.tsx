import { cacheLife, cacheTag } from "next/cache";
import { DepartmentCard } from "@/components/home/DepartmentCard";
import { getDepartmentPreviews } from "@/lib/data/departments";

// Home: every department as a card of real product photos (frontend-rebuild.md C6). The hero,
// product rails and animations arrive with roadmap slice R4. Catalogue-only content, so the whole
// page is cached.
export default async function Home() {
  "use cache";
  cacheLife("days");
  cacheTag("home");
  const departments = await getDepartmentPreviews();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-fg">Shop by department</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {departments.map((department) => (
          <DepartmentCard key={department.id} department={department} />
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { ROUTES } from "@/lib/constants/links";
import type { Department } from "@/lib/data/departments";

type ExploreDepartmentsCardProps = {
  departments: Department[];
};

// Mobile-only closing card (spec 5.13): every department as a plain text link, two per row.
// Built from the same `Department` rows the header's own department picker uses, so this list
// can never drift from the real 12 departments.
export function ExploreDepartmentsCard({ departments }: ExploreDepartmentsCardProps) {
  return (
    <div className="bg-white px-4 pb-4 pt-5">
      <Link href={ROUTES.search} className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text">Explore Departments</h2>
      </Link>
      <div className="grid grid-cols-2 gap-y-3">
        {departments.map((department) => (
          <Link
            key={department.slug}
            href={`${ROUTES.search}?i=${department.slug}`}
            className="text-sm text-link hover:text-link-hover hover:underline"
          >
            {department.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

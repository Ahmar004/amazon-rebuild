import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { imageAt } from "@/lib/assets";
import { ROUTES } from "@/lib/constants/links";
import type { DepartmentPreview } from "@/lib/data/departments";

// A department tile: its name over a 2x2 grid of real product photos, linking to its search page.
export function DepartmentCard({ department }: { department: DepartmentPreview }) {
  return (
    <Link
      href={`${ROUTES.search}?i=${department.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-accent"
    >
      <h2 className="text-base font-bold text-fg">{department.name}</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {department.images.map((src) => (
          <div key={src} className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- dataset image, pre-sized by URL (next.config.ts) */}
            <img src={imageAt(src, "SY200")} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
          </div>
        ))}
      </div>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">
        Shop now
        <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

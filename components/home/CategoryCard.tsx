import Link from "next/link";
import { imageAt } from "@/lib/assets";
import { ROUTES } from "@/lib/constants/links";
import type { CategoryPreview } from "@/lib/data/categories";

// A compact category tile: one real product photo that swaps to a second one on hover, and the
// category name, linking to its search page (frontend-rebuild.md C6).
export function CategoryCard({ category }: { category: CategoryPreview }) {
  const [first, second] = category.images;
  return (
    <Link
      href={`${ROUTES.search}?i=${category.slug}`}
      className="group flex h-full flex-col items-center gap-2 rounded-xl border border-border bg-surface p-3 text-center shadow-card transition duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-pop"
    >
      <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-white">
        {first && <TileImage src={first} className={second ? "transition-opacity duration-500 group-hover:opacity-0" : ""} />}
        {second && <TileImage src={second} className="absolute inset-0 m-auto opacity-0 transition-opacity duration-500 group-hover:opacity-100" />}
      </span>
      <span className="line-clamp-2 text-sm font-semibold text-fg group-hover:text-accent">{category.name}</span>
    </Link>
  );
}

function TileImage({ src, className }: { src: string; className: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- dataset image, pre-sized by URL (next.config.ts)
    <img src={imageAt(src, "SY200")} alt="" loading="lazy" className={`max-h-[80%] max-w-[80%] object-contain ${className}`} />
  );
}

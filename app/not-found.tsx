import Link from "next/link";
import { SearchX } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SearchBar } from "@/components/layout/SearchBar";
import { buttonClass } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants/links";

// Rendered by Next.js for any unmatched route, outside the shop layout: the logo, a short
// message, a search box and a way home.
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <Link href={ROUTES.home} aria-label="Shopeedo home">
        <Logo />
      </Link>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <SearchX size={30} aria-hidden="true" />
      </span>
      <div>
        <h1 className="text-xl font-bold text-fg">We couldn&apos;t find that page</h1>
        <p className="mt-1 text-sm text-fg-muted">The link may be old, or the page may have moved. Try a search instead.</p>
      </div>
      <div className="w-full max-w-[500px]">
        <SearchBar categories={[]} />
      </div>
      <Link href={ROUTES.home} className={buttonClass({ variant: "secondary" })}>
        Back to the home page
      </Link>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Sprite } from "@/components/ui/Sprite";
import { SearchBar } from "@/components/layout/SearchBar";
import { NOT_FOUND_IMAGE } from "@/lib/assets";
import { ROUTES } from "@/lib/constants/links";

// Amazon's 404 page (task-4-brief.md). Rendered by Next.js for any unmatched route, so it lives
// outside the (shop) route group and has no header/footer - the logo, heading, search box and
// dog illustration are all Amazon shows on the real page.
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[600px] flex-col items-center gap-6 px-6 py-16 text-center">
      <Link href={ROUTES.home}>
        <Sprite name="logo" label="Amazon" />
      </Link>

      <h1 className="text-lg text-text">
        Sorry! We couldn&apos;t find that page. Try searching or go to{" "}
        <Link href={ROUTES.home} className="text-link hover:underline hover:text-link-hover">
          Amazon&apos;s home page
        </Link>
        .
      </h1>

      <div className="w-full max-w-[500px]">
        <SearchBar departments={[]} />
      </div>

      <Image src={NOT_FOUND_IMAGE} alt="" width={220} height={220} className="mt-4" />
    </div>
  );
}

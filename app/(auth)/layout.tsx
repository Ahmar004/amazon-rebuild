import Link from "next/link";
import { Sprite } from "@/components/ui/Sprite";
import { SafetyNotice } from "@/components/layout/SafetyNotice";
import { FooterMinimal } from "@/components/layout/FooterMinimal";
import { ROUTES } from "@/lib/constants/links";

// Shared shell for /ap/signin, /ap/signin/password and /ap/register (docs/design.md 6.6: "The
// auth layout shows the logo, the box, the minimal footer, and SafetyNotice under the box").
// Mobile is the same centred box at full width minus 16px margins (plan's Mobile note), which
// falls out of `px-4` on the wrapper plus each page's own `max-w-[350px]` box.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-1 flex-col items-center px-4 py-8">
        <Link href={ROUTES.home} className="mb-6">
          <Sprite name="logo" label="Amazon" />
        </Link>

        {children}

        <div className="mt-4 w-full max-w-[350px]">
          <SafetyNotice />
        </div>
      </div>

      <FooterMinimal />
    </div>
  );
}

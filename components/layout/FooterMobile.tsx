import { Sprite } from "@/components/ui/Sprite";
import { NavAnchor } from "@/components/layout/NavAnchor";
import { BackToTop } from "@/components/layout/BackToTop";
import { GlobeIcon } from "@/components/layout/GlobeIcon";
import { SafetyNotice } from "@/components/layout/SafetyNotice";
import { FOOTER_LEGAL, ROUTES } from "@/lib/constants/links";

const MOBILE_FOOTER_LINKS = [
  { label: "Your Account", href: ROUTES.account, external: false },
  { label: "Your Orders", href: ROUTES.orders, external: false },
  { label: "Customer Service", href: ROUTES.customerService, external: false },
  { label: "Today's Deals", href: ROUTES.deals, external: false },
] as const;

// Mobile web footer (<768px; Footer takes over from 768px, app/(shop)/layout.tsx): a
// "TOP OF PAGE" band, two link columns, the display-only locale rows, the legal links, the
// copyright line and the safety notice. Values from task-4-brief.md and
// docs/recon/mobile-app-views-captured.
export function FooterMobile() {
  return (
    <footer className="md:hidden">
      <BackToTop label="TOP OF PAGE" showCaret className="h-auto py-2" />

      <div className="bg-subnav px-6 py-6 text-white">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-center text-sm">
          {MOBILE_FOOTER_LINKS.map((link) => (
            <NavAnchor key={link.label} link={link} className="hover:underline" />
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <div
            role="img"
            aria-label="Language: English"
            className="flex items-center gap-1.5 text-[13px] text-footer-box-text"
          >
            <GlobeIcon />
            English
          </div>
          <div
            role="img"
            aria-label="Country: United States"
            className="flex items-center gap-1.5 text-[13px] text-footer-box-text"
          >
            <Sprite name="usFlag" />
            United States
          </div>
        </div>

        <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-footer-border pt-4">
          {FOOTER_LEGAL.map((link) => (
            <NavAnchor
              key={link.label}
              link={link}
              className="min-w-0 max-w-full text-center text-[11px] text-footer-link hover:underline"
            />
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-footer-muted">
          &copy; 1996-2026, Amazon.com, Inc. or its affiliates
        </p>
        <SafetyNotice className="mt-2 text-footer-muted" />
      </div>
    </footer>
  );
}

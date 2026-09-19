import { Sprite } from "@/components/ui/Sprite";
import { NavAnchor } from "@/components/layout/NavAnchor";
import { BackToTop } from "@/components/layout/BackToTop";
import { GlobeIcon } from "@/components/layout/GlobeIcon";
import { SafetyNotice } from "@/components/layout/SafetyNotice";
import { FOOTER_BRANDS, FOOTER_COLUMNS, FOOTER_LEGAL } from "@/lib/constants/links";

// Desktop footer (>=768px; hidden below it in app/(shop)/layout.tsx): back-to-top band, four
// link columns, the display-only locale row (spec #18 - no alternatives to pick), the
// sister-brand grid, then the legal row and safety notice. Values from task-4-brief.md / recon.
export function Footer() {
  return (
    <footer className="hidden md:block">
      <BackToTop />

      <div className="bg-subnav text-white">
        <div className="mx-auto grid max-w-[980px] grid-cols-4 gap-x-[110px] px-10 py-10">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="mb-3 text-base font-bold text-white">{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label} className="mb-[10px]">
                    <NavAnchor
                      link={link}
                      className="text-sm leading-[18px] text-footer-link hover:underline"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-footer-border px-10 py-8">
          <div className="flex flex-col items-center gap-4">
            <Sprite name="logo" label="Amazon" className="h-[34px] w-[98px]" />

            <div className="flex items-center gap-3">
              <div
                role="img"
                aria-label="Language: English"
                className="flex items-center gap-1.5 rounded-[3px] border border-footer-box-border px-3 py-1.5 text-[13px] text-footer-box-text"
              >
                <GlobeIcon />
                English
                <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" className="ml-1">
                  <path d="M0 0 L5 6 L10 0 Z" fill="currentColor" />
                </svg>
              </div>

              <div
                role="img"
                aria-label="Currency: U.S. Dollar"
                className="rounded-[3px] border border-footer-box-border px-3 py-1.5 text-[13px] text-footer-box-text"
              >
                $ USD - U.S. Dollar
              </div>

              <div
                role="img"
                aria-label="Country: United States"
                className="flex items-center gap-1.5 rounded-[3px] border border-footer-box-border px-3 py-1.5 text-[13px] text-footer-box-text"
              >
                <Sprite name="usFlag" />
                United States
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-footer-bottom text-white">
        <div className="mx-auto max-w-[980px] px-10 py-8">
          <div className="grid grid-cols-7 gap-x-4 gap-y-6">
            {FOOTER_BRANDS.map((brand) => (
              <a key={brand.name} href={brand.href} target="_blank" rel="noopener noreferrer">
                <p className="text-xs text-footer-link">{brand.name}</p>
                <p className="text-xs text-footer-muted">{brand.tagline}</p>
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-2 border-t border-footer-border pt-6">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              {FOOTER_LEGAL.map((link) => (
                <NavAnchor
                  key={link.label}
                  link={link}
                  className="text-xs text-footer-link hover:underline"
                />
              ))}
            </div>
            <p className="text-xs text-footer-link">
              &copy; 1996-2026, Amazon.com, Inc. or its affiliates
            </p>
            <SafetyNotice className="text-footer-muted" />
          </div>
        </div>
      </div>
    </footer>
  );
}

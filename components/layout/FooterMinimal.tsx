import { NavAnchor } from "@/components/layout/NavAnchor";
import { SafetyNotice } from "@/components/layout/SafetyNotice";
import { FOOTER_LEGAL, ROUTES } from "@/lib/constants/links";

// Amazon's minimal footer (spec 5.2): Conditions of Use, Privacy Notice, Help and the copyright
// line on white, for the auth and checkout layouts (later slices). Built now per task-4-brief.md
// so those layouts can import it without a follow-up task.
export function FooterMinimal() {
  const [conditions, privacy] = FOOTER_LEGAL;

  return (
    <footer className="bg-white">
      <div className="minimal-footer-divider" aria-hidden="true" />
      <div className="flex flex-col items-center gap-2 py-6">
        <div className="flex items-center gap-4">
          <NavAnchor link={conditions} className="text-[11px] text-link hover:underline" />
          <NavAnchor link={privacy} className="text-[11px] text-link hover:underline" />
          <NavAnchor
            link={{ label: "Help", href: ROUTES.customerService, external: false }}
            className="text-[11px] text-link hover:underline"
          />
        </div>
        <p className="text-[11px] text-text-muted">&copy; 1996-2026, Amazon.com, Inc. or its affiliates</p>
        <SafetyNotice />
      </div>
    </footer>
  );
}

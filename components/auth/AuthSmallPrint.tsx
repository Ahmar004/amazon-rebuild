import { FOOTER_LEGAL, ROUTES } from "@/lib/constants/links";
import { NavAnchor } from "@/components/layout/NavAnchor";

// "By continuing, you agree to Amazon's Conditions of Use and Privacy Notice." plus "Need help?",
// shown under the identify step's Continue button (docs/superpowers/plans/
// 2026-09-19-slice-6-auth.md).
export function AuthSmallPrint() {
  const [conditions, privacy] = FOOTER_LEGAL;

  return (
    <p className="mt-3 text-xs text-text">
      By continuing, you agree to Amazon&apos;s{" "}
      <NavAnchor link={conditions} className="text-link hover:text-link-hover hover:underline" />{" "}
      and{" "}
      <NavAnchor link={privacy} className="text-link hover:text-link-hover hover:underline" />.{" "}
      <br />
      <a
        href={ROUTES.customerService}
        className="text-link hover:text-link-hover hover:underline"
      >
        Need help?
      </a>
    </p>
  );
}

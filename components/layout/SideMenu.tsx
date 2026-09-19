"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Sprite } from "@/components/ui/Sprite";
import { NavAnchor } from "@/components/layout/NavAnchor";
import { useDismiss } from "@/hooks/useDismiss";
import { ROUTES, SIDE_MENU_PROGRAMS, SIDE_MENU_TRENDING, type NavLink } from "@/lib/constants/links";
import type { Department } from "@/lib/data/departments";

type SideMenuProps = {
  departments: Department[];
};

// The "All" hamburger button and the drawer it opens: a 365px white panel sliding in from the
// left over an 80%-black overlay. Owns its own open state so SubNav stays a server component.
export function SideMenu({ departments }: SideMenuProps) {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setEntered(false);
  }, []);

  useDismiss(drawerRef, open, close);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();
    const frame = requestAnimationFrame(() => setEntered(true));

    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
      cancelAnimationFrame(frame);
    };
  }, [open]);

  const departmentLinks: NavLink[] = departments.map((department) => ({
    label: department.name,
    href: `${ROUTES.search}?i=${department.slug}`,
    external: false,
  }));

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-sm border border-transparent px-[9px] py-1 text-sm font-bold text-white hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <Sprite name="hamburger" />
        All
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80" aria-hidden="true" onClick={close} />

          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`absolute inset-y-0 left-0 flex w-[365px] flex-col overflow-y-auto bg-white outline-none transition-transform duration-300 ease-out ${
              entered ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex h-[50px] shrink-0 items-center gap-3 bg-subnav px-4 text-white">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M4 20c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
              <Link href={ROUTES.signIn} id={titleId} className="text-[19px] font-bold">
                Hello, sign in
              </Link>
            </div>

            <Section title="Trending" bordered>
              {SIDE_MENU_TRENDING.map((link) => (
                <Row key={link.label} link={link} />
              ))}
            </Section>

            <Section title="Shop by Department" bordered>
              {departmentLinks.map((link) => (
                <Row key={link.href} link={link} />
              ))}
            </Section>

            <Section title="Programs & Features" bordered>
              {SIDE_MENU_PROGRAMS.map((link) => (
                <Row key={link.label} link={link} />
              ))}
            </Section>

            <Section title="Help & Settings">
              <Row link={{ label: "Your Account", href: ROUTES.account, external: false }} />
              <div className="flex items-center gap-3 py-[13px] pl-9 pr-5 text-sm text-side-menu-text">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
                English
              </div>
              <div className="flex items-center gap-3 py-[13px] pl-9 pr-5 text-sm text-side-menu-text">
                <Sprite name="usFlag" />
                United States
              </div>
              <Row link={{ label: "Customer Service", href: ROUTES.customerService, external: false }} />
              <Row link={{ label: "Sign in", href: ROUTES.signIn, external: false }} />
            </Section>
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="absolute top-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ left: 365 + 8 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 2 L22 22 M22 2 L2 22" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}

function Section({ title, children, bordered }: { title: string; children: ReactNode; bordered?: boolean }) {
  return (
    <div className={bordered ? "border-b-[5px] border-side-menu-divider" : ""}>
      <h2 className="py-[13px] pl-9 pr-5 text-lg font-bold text-side-menu-text">{title}</h2>
      {children}
    </div>
  );
}

function Row({ link }: { link: NavLink }) {
  return (
    <NavAnchor
      link={link}
      className="block py-[13px] pl-9 pr-5 text-sm text-side-menu-text hover:bg-side-menu-hover"
    />
  );
}

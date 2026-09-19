"use client";

import { useId, useRef } from "react";
import { Popover } from "@/components/ui/Popover";
import { Sprite } from "@/components/ui/Sprite";
import { CaretDown } from "@/components/layout/CaretDown";
import { navItemClass } from "@/components/layout/navItemClass";
import { useHoverPopover } from "@/hooks/useHoverPopover";
import { CHANGE_COUNTRY_URL, LANGUAGE_HELP_URL } from "@/lib/constants/links";

// The "EN" language switcher in the top nav. Only English exists (spec #18), so the popover
// shows a single checked radio row rather than a language list.
export function LanguagePopover() {
  const { open, onMouseEnter, onMouseLeave, toggle, close } = useHoverPopover();
  const radioId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative shrink-0" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex items-center gap-1 ${navItemClass}`}
      >
        <Sprite name="usFlag" />
        <span className="text-sm font-bold">EN</span>
        <CaretDown />
      </button>

      <Popover
        open={open}
        onClose={close}
        triggerRef={triggerRef}
        anchorClassName="left-0"
        className="w-[280px] p-4 text-text"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-bold">Change language</h3>
          <a
            href={LANGUAGE_HELP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-link hover:text-link-hover hover:underline"
          >
            Learn more
          </a>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            id={radioId}
            type="radio"
            name="language"
            checked
            readOnly
            className="h-4 w-4 accent-link"
          />
          <label htmlFor={radioId} className="text-sm">
            English - EN
          </label>
        </div>

        <hr className="my-3 border-border" />

        <div className="flex items-center gap-2">
          <Sprite name="usFlag" />
          <p className="text-sm">You are shopping on Amazon.com</p>
        </div>

        <a
          href={CHANGE_COUNTRY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-link hover:text-link-hover hover:underline"
        >
          Change country/region.
        </a>
      </Popover>
    </div>
  );
}

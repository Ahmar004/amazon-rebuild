"use client";

type BackToTopProps = {
  /** Desktop footer says "Back to top"; the mobile footer says "TOP OF PAGE". */
  label?: string;
  /** Mobile bar shows a small up-caret above the label; desktop does not. */
  showCaret?: boolean;
  /** Overrides the default 50px desktop bar height. */
  className?: string;
};

// Full-width bar that smooth-scrolls the page back to the top. Shared by Footer (desktop) and
// FooterMobile ("TOP OF PAGE"), per task-4-brief.md.
export function BackToTop({ label = "Back to top", showCaret = false, className }: BackToTopProps) {
  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-center justify-center bg-back-to-top text-[13px] text-white hover:bg-back-to-top-hover focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${className ?? "h-[50px]"}`}
    >
      {showCaret ? (
        <span className="flex flex-col items-center gap-0.5 py-2">
          <svg width="12" height="7" viewBox="0 0 12 7" aria-hidden="true">
            <path d="M1 6 L6 1 L11 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
          {label}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

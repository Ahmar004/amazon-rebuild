// Globe/"language" outline SVG used by the footer's language box (desktop and mobile) and the
// side menu's "English" row (CLAUDE.md: extract to components/ at the second use). Plain inline
// SVG, no unicode glyph.
export function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

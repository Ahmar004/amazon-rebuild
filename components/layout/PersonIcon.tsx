// Person-outline SVG used by the side menu's "Hello, sign in" header and the mobile header's
// account icon (CLAUDE.md: extract to components/ at the second use). Plain inline SVG, no
// unicode glyph.
export function PersonIcon({ className }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 20c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

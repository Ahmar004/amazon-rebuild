type SearchIconProps = {
  /** Pixel size for both width and height (SearchBar uses 22, HeaderMobile uses 20). */
  size: number;
};

// Magnifying-glass icon for the search button, shared by SearchBar (desktop) and HeaderMobile
// (mobile) (CLAUDE.md: extract to components/ at the second use). Plain inline SVG, no unicode
// glyph; colour comes from the --color-search-icon token.
export function SearchIcon({ size }: SearchIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      style={{ color: "var(--color-search-icon)" }}
    >
      <circle cx="9.5" cy="9.5" r="7" stroke="currentColor" strokeWidth="2" />
      <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

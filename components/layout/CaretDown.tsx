// Small down caret used beside "Account & Lists", the department select and the language
// switcher. A plain inline SVG (CLAUDE.md: icons are SVGs, never unicode).
export function CaretDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 6"
      width="10"
      height="6"
      aria-hidden="true"
      className={className}
    >
      <path d="M0 0 L5 6 L10 0 Z" fill="currentColor" />
    </svg>
  );
}

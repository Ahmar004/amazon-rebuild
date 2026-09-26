type LogoProps = {
  /** "inverse" is for dark bars (light text); "default" follows the page foreground. */
  tone?: "default" | "inverse";
  /** Hides the wordmark and keeps only the square mark, for tight spaces. */
  compact?: boolean;
  className?: string;
};

// Shopeedo brand (frontend-rebuild.md C1): a rounded-square mark holding a shopping-bag "S",
// followed by the wordmark with the accent on "eedo".
export function Logo({ tone = "default", compact = false, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="9" className="fill-accent" />
        <path d="M11 11.5V10a5 5 0 0 1 10 0v1.5" fill="none" strokeWidth="2.2" strokeLinecap="round" className="stroke-accent-fg" />
        <path
          d="M20.5 15.2c-.9-1.2-2.6-1.9-4.4-1.9-2.4 0-4.1 1.2-4.1 3 0 4 8.6 2.3 8.6 6.3 0 1.8-1.8 3.1-4.4 3.1-2 0-3.8-.8-4.7-2.1"
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="stroke-accent-fg"
        />
      </svg>
      {compact ? (
        <span className="sr-only">Shopeedo</span>
      ) : (
        <span className={`text-[22px] font-extrabold leading-none tracking-tight ${tone === "inverse" ? "text-inverse-fg" : "text-fg"}`}>
          Shop<span className="text-accent">eedo</span>
        </span>
      )}
    </span>
  );
}

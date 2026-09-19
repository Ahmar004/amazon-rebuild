// The demo disclaimer CLAUDE.md requires on the footer and every auth/checkout box: keeps the
// live link from being flagged as phishing. Text is exact and must never be edited or removed.
export function SafetyNotice({ className }: { className?: string }) {
  return (
    <p className={`text-center text-[11px] text-text-muted ${className ?? ""}`}>
      Demo clone built for an 8x assessment. Not affiliated with Amazon. Do not enter real Amazon
      credentials.
    </p>
  );
}

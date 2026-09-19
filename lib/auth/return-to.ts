// Guards the post-sign-in/register redirect target (docs/design.md 6.6: "Redirect to a safe
// return_to: it must start with / and not //; otherwise /"). CLAUDE.md's global constraint adds
// "/\\" (a backslash-prefixed path, which some browsers treat as protocol-relative) to the same
// rule. Pure, so it's covered by tests/unit/auth/return-to.test.ts without touching cookies().
export function safeReturnTo(value: string | null | undefined): string {
  if (!value) return "/";
  // Strip control characters first: browsers drop TAB/LF/CR while parsing a URL, so
  // "/\t/evil.com" does not literally start with "//" here but resolves to a
  // protocol-relative "//evil.com" once the browser follows the Location header.
  const stripped = value.replace(/[\u0000-\u001f]/g, "");
  if (!stripped.startsWith("/")) return "/";
  if (stripped.startsWith("//") || stripped.startsWith("/\\")) return "/";
  return stripped;
}

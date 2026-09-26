// The catalogue comes from a public dataset of one marketplace's listings, so some text names that
// marketplace. Shopeedo must not show that name anywhere (frontend-rebuild.md point 1), so the seed
// and scripts/scrub-store-name.ts pass catalogue text through these functions.

// The word, optionally with ".com" and "'s". Dataset text often glues words together, so a match
// counts when the next character is not a lowercase letter ("AmazonPets" yes, "amazonite" no) and
// it either starts a word or starts with a capital A ("YearAmazon"). The checks run in the
// callback because the case-insensitive flag would apply to lookarounds too.
const PATTERN = /amazon(\.com)?('s)?/gi;

function isStoreName(text: string, match: string, offset: number): boolean {
  if (/[a-z]/.test(text.charAt(offset + match.length))) return false;
  const startsWord = !/[a-z0-9]/i.test(text.charAt(offset - 1));
  return startsWord || match.startsWith("A");
}

function replaceWord(text: string, replacement: (possessive: string) => string): string {
  return text.replace(PATTERN, (match: string, _dotCom: string | undefined, possessive: string | undefined, offset: number) =>
    isStoreName(text, match, offset) ? replacement(possessive ?? "") : match,
  );
}

// Names (brands, titles, category segments, brand details): the word is removed, since "Basics"
// reads better than a made-up house brand. A name that was only the word becomes "Generic".
export function scrubName(text: string): string {
  const removed = replaceWord(text, () => " ");
  if (removed === text) return text;
  const cleaned = removed
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/^[\s\-,:|]+|[\s\-,:|]+$/g, "")
    .trim();
  return cleaned || "Generic";
}

// Prose (descriptions, features, reviews): the word becomes "Shopeedo", so "bought it on ..." still
// reads naturally.
export function scrubProse(text: string): string {
  return replaceWord(text, (possessive) => `Shopeedo${possessive}`);
}

// Brand-like detail values are names; everything else in the specs table is prose.
const NAME_KEYS = new Set(["brand", "manufacturer", "brand name", "manufacturer name"]);

export function scrubDetails(details: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(details).map(([key, value]) => [key, NAME_KEYS.has(key.toLowerCase()) ? scrubName(value) : scrubProse(value)]),
  );
}

// The name other shoppers see for a user, on reviews and as a seller: "Robin Tester" -> "Robin T.",
// recognisable without publishing anyone's full name. No imports, so any layer can use it.
function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function publicName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Shopeedo customer";
  const first = capitalise(parts[0]);
  return parts.length === 1 ? first : `${first} ${parts.at(-1)!.charAt(0).toUpperCase()}.`;
}

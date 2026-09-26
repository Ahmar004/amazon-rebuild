// Order id format: 3 digits, 7 digits, 7 digits, separated by hyphens (docs/design.md 5.1).
// Random rather than sequential - nothing here needs to be unguessable, just shaped right, and
// the `orders.id` primary key catches the astronomically unlikely collision.
function digits(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(Math.random() * 10).toString();
  return out;
}

export function newOrderId(): string {
  return `${digits(3)}-${digits(7)}-${digits(7)}`;
}

// "1 item", "3 items", "2 people": a number with the right form of its noun.
export function countLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${count.toLocaleString("en-US")} ${count === 1 ? singular : plural}`;
}

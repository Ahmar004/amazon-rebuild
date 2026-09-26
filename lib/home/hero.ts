// Pure helpers for the home hero carousel (frontend-rebuild.md point 8). A click in the left
// quarter of a slide goes back, a click in the right quarter goes forward, and the middle half is
// left to the slide's own link.

export type HeroZone = "prev" | "next" | "none";

const EDGE_ZONE = 0.25;

export function clickZone(offsetX: number, width: number): HeroZone {
  if (width <= 0) return "none";
  const ratio = offsetX / width;
  if (ratio < EDGE_ZONE) return "prev";
  if (ratio > 1 - EDGE_ZONE) return "next";
  return "none";
}

export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

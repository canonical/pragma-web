import type { WellBox } from "./types.js";

/**
 * The point where the segment from `towards` to `box`'s centre crosses the
 * box border (plus a small gap), so edges meet nodes at their edge instead
 * of diving underneath them. Falls back to the centre for a degenerate
 * (zero-length) segment, and never overshoots `towards` itself.
 *
 * @param box - The node the edge ends at.
 * @param towards - The point the edge comes from.
 * @param gap - Clearance between the border and the endpoint, in px.
 * @returns The trimmed endpoint.
 */
export const edgeEndpoint = (
  box: Readonly<WellBox>,
  towards: { readonly x: number; readonly y: number },
  gap: number,
): { x: number; y: number } => {
  const dx = towards.x - box.x;
  const dy = towards.y - box.y;
  if (dx === 0 && dy === 0) return { x: box.x, y: box.y };
  const halfWidth = box.width / 2 + gap;
  const halfHeight = box.height / 2 + gap;
  // Slab test: the smallest positive t where the ray leaves the box.
  const tx = dx === 0 ? Number.POSITIVE_INFINITY : halfWidth / Math.abs(dx);
  const ty = dy === 0 ? Number.POSITIVE_INFINITY : halfHeight / Math.abs(dy);
  const t = Math.min(tx, ty, 1);
  return { x: box.x + dx * t, y: box.y + dy * t };
};

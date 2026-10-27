import type { GridPoint } from "./types.js";

/**
 * Build the octilinear path between two grid points: the straight segment
 * when the two already lie on one horizontal, vertical or diagonal line, and
 * otherwise a diagonal leg followed by a straight one, bending once at the
 * point where the diagonal has covered the shorter of the two distances.
 *
 * @param from - Where the path starts.
 * @param to - Where the path ends.
 * @returns The path's vertices, `from` first and `to` last, every leg
 *   horizontal, vertical or at 45°.
 */
export default function buildOctilinearPath(
  from: GridPoint,
  to: GridPoint,
): readonly GridPoint[] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const run = Math.abs(dx);
  const rise = Math.abs(dy);
  if (run === 0 || rise === 0 || run === rise) return [from, to];
  const diagonal = Math.min(run, rise);
  const bend = {
    x: from.x + Math.sign(dx) * diagonal,
    y: from.y + Math.sign(dy) * diagonal,
  };
  return [from, bend, to];
}

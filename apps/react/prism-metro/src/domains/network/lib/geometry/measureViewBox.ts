import { MARGIN } from "./constants.js";
import type { DrawingPoint } from "./types.js";

/**
 * Measure the drawing's viewBox: the box around every point it draws, with
 * the margin on every side for the names of the outermost stations.
 *
 * @param points - Every vertex and mark corner the drawing holds, at least one.
 * @returns The `viewBox` attribute, `minX minY width height`.
 * @throws When there is nothing to measure.
 */
export default function measureViewBox(
  points: readonly DrawingPoint[],
): string {
  if (points.length === 0) throw new Error("an empty drawing has no viewBox");
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs) - MARGIN;
  const minY = Math.min(...ys) - MARGIN;
  const width = Math.max(...xs) + MARGIN - minX;
  const height = Math.max(...ys) + MARGIN - minY;
  return [minX, minY, width, height].join(" ");
}

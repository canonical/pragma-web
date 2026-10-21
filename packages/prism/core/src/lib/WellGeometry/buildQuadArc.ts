import settle from "./settle.js";
import type { QuadArc } from "./types.js";

/**
 * Build a semantic arc: a quadratic bowing `bow` px off its chord, wearing
 * its label at the curve's apex (t = 0.5). The bow's sign flips which side
 * the arc swells toward; magnitude stacks for parallel edges.
 *
 * @param start - The arc's first endpoint.
 * @param end - The arc's second endpoint.
 * @param bow - How far the control point sits off the chord, in px.
 * @returns The SVG path and the label anchor, settled.
 */
export default function buildQuadArc(
  start: { readonly x: number; readonly y: number },
  end: { readonly x: number; readonly y: number },
  bow: number,
): QuadArc {
  const middleX = (start.x + end.x) / 2;
  const middleY = (start.y + end.y) / 2;
  const chordX = end.x - start.x;
  const chordY = end.y - start.y;
  const length = Math.hypot(chordX, chordY) || 1;
  const controlX = middleX - (chordY / length) * bow;
  const controlY = middleY + (chordX / length) * bow;
  return {
    d: `M ${settle(start.x)} ${settle(start.y)} Q ${settle(controlX)} ${settle(controlY)} ${settle(end.x)} ${settle(end.y)}`,
    labelAt: {
      x: settle((start.x + end.x + 2 * controlX) / 4),
      y: settle((start.y + end.y + 2 * controlY) / 4 - 6),
    },
  };
}

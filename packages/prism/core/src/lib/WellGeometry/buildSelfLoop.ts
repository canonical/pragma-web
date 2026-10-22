import settle from "./settle.js";
import type { QuadArc, WellBox } from "./types.js";

/**
 * Build a self-loop: the edge of a property whose domain IS its range. It
 * swells from the box's east side, its label riding beyond the loop.
 *
 * @param box - The node the loop starts and ends at.
 * @returns The SVG path and the label anchor, settled.
 */
export default function buildSelfLoop(box: Readonly<WellBox>): QuadArc {
  const eastX = box.x + box.width / 2;
  return {
    d: `M ${settle(eastX - 4)} ${settle(box.y - 8)} C ${settle(eastX + 52)} ${settle(box.y - 44)}, ${settle(eastX + 52)} ${settle(box.y + 36)}, ${settle(eastX - 2)} ${settle(box.y + 10)}`,
    labelAt: { x: settle(eastX + 56), y: settle(box.y) },
  };
}

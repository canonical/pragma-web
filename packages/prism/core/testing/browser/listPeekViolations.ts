import {
  PEEK_EDGE_INSET_PX,
  PEEK_TOLERANCE_PX,
  PEEK_WIDTH_PX,
} from "./constants.js";
import placePeek from "./placePeek.js";
import type { PeekMeasure } from "./types.js";

/**
 * List what an open peek breaks of the peek's contract: a dialog, inside
 * no link, with a link a pointer reaches; 248px wide, or the viewport less
 * its insets where the viewport is narrower; no taller than the viewport
 * less its inset at each end, and wholly inside it; 4px from its chip, in
 * the first of its places that fits (`placePeek`).
 *
 * @param measure - What `measurePeek` read, with a peek open.
 * @returns One line per broken rule; none for a peek that keeps them all.
 */
export default function listPeekViolations(
  measure: PeekMeasure,
): readonly string[] {
  const { peek, viewport } = measure;
  if (peek === null) return ["no peek is open"];
  const width = Math.min(
    PEEK_WIDTH_PX,
    viewport.width - 2 * PEEK_EDGE_INSET_PX,
  );
  const { actual, chosen } = placePeek(measure);
  return [
    measure.role === "dialog" ? null : `its role is ${measure.role}`,
    measure.inLink ? "it sits inside a link" : null,
    measure.liveLinks.length > 0 ? null : "it holds no live link",
    Math.abs(peek.width - width) <= PEEK_TOLERANCE_PX
      ? null
      : `it is ${peek.width}px wide, not ${width}px`,
    peek.height <= viewport.height - 2 * PEEK_EDGE_INSET_PX + PEEK_TOLERANCE_PX
      ? null
      : `it is ${peek.height}px high in a ${viewport.height}px viewport`,
    peek.left >= -PEEK_TOLERANCE_PX &&
    peek.top >= -PEEK_TOLERANCE_PX &&
    peek.right <= viewport.width + PEEK_TOLERANCE_PX &&
    peek.bottom <= viewport.height + PEEK_TOLERANCE_PX
      ? null
      : `it reaches past the viewport: ${JSON.stringify(peek)}`,
    actual.block === chosen.block && actual.inline === chosen.inline
      ? null
      : `it lies ${actual.block} the chip from ${actual.inline}, where its order puts it ${chosen.block} from ${chosen.inline}`,
  ].filter((line): line is string => line !== null);
}

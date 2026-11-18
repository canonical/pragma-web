import { STROKE_MIN_WIDTH, STROKE_STEPS } from "./constants.js";
import type { StrokeWeight } from "./types.js";

/**
 * Weigh a relation's stroke by the instance statements it covers: 1px
 * below 10, 2px from 10, 4px from 100 and 8px from 1,000, by integer
 * comparison so every platform draws the same width, and dashed at 0,
 * where nothing instantiates it.
 *
 * @param count - The statements the relation covers.
 * @returns The stroke's width and whether it is dashed.
 * @throws When the count is not a non-negative integer.
 */
export default function weighStroke(count: number): StrokeWeight {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error(
      `a relation's count is a non-negative integer, not ${count}`,
    );
  }
  const step = STROKE_STEPS.find((candidate) => count >= candidate.from);
  return { width: step?.width ?? STROKE_MIN_WIDTH, dashed: count === 0 };
}

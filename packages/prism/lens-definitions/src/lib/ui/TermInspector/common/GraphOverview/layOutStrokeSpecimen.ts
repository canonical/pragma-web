import {
  buildArrowhead,
  formatPathData,
  type Rect,
} from "@canonical/prism-core";
import fitArrowheads from "../../../../classGraph/fitArrowheads.js";
import type { StrokeWeight } from "../../../../classGraph/types.js";
import {
  SPECIMEN_MARGIN,
  STROKE_SPECIMEN_LENGTH,
  STROKE_SPECIMEN_REACH,
} from "./constants.js";

/**
 * Lay a stroke specimen out: a relation's straight line ending in its
 * filled head, fitted to the stroke as the canvas fits it, in a frame as
 * tall as the largest head so every step's drawing lines up.
 *
 * @param stroke - The stroke the specimen shows.
 * @returns The line, its head and the frame that holds them.
 */
export default function layOutStrokeSpecimen(stroke: StrokeWeight): {
  readonly d: string;
  readonly heads: readonly string[];
  readonly frame: Rect;
} {
  const { d, heads } = fitArrowheads(
    formatPathData([
      ["M", 0, 0],
      ["H", STROKE_SPECIMEN_LENGTH],
    ]),
    [formatPathData(buildArrowhead(STROKE_SPECIMEN_LENGTH, 0, true))],
    stroke.width,
  );
  return {
    d,
    heads,
    frame: {
      x: -SPECIMEN_MARGIN,
      y: -STROKE_SPECIMEN_REACH - SPECIMEN_MARGIN,
      w: STROKE_SPECIMEN_LENGTH + 2 * SPECIMEN_MARGIN,
      h: 2 * (STROKE_SPECIMEN_REACH + SPECIMEN_MARGIN),
    },
  };
}

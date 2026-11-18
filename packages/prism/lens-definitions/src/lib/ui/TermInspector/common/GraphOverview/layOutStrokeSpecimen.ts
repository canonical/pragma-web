import {
  buildArrowhead,
  formatPathData,
  type Rect,
} from "@canonical/prism-core";
import fitRelationStroke from "../../../../classGraph/fitRelationStroke.js";
import type {
  RelationStroke,
  StrokeWeight,
} from "../../../../classGraph/types.js";
import {
  SPECIMEN_MARGIN,
  STROKE_SPECIMEN_LENGTH,
  STROKE_SPECIMEN_REACH,
} from "./constants.js";

/**
 * Lay a stroke specimen out: a relation's straight line ending in its
 * filled head, fitted to the stroke by the canvas's own code, in a frame
 * as tall as the largest head so every step's drawing lines up.
 *
 * @param stroke - The stroke the specimen shows.
 * @returns The line, its head, width and dash, and the frame that holds
 *   them.
 */
export default function layOutStrokeSpecimen(
  stroke: StrokeWeight,
): RelationStroke & { readonly frame: Rect } {
  const fitted = fitRelationStroke(
    formatPathData([
      ["M", 0, 0],
      ["H", STROKE_SPECIMEN_LENGTH],
    ]),
    [formatPathData(buildArrowhead(STROKE_SPECIMEN_LENGTH, 0, true))],
    stroke,
  );
  return {
    ...fitted,
    frame: {
      x: -SPECIMEN_MARGIN,
      y: -STROKE_SPECIMEN_REACH - SPECIMEN_MARGIN,
      w: STROKE_SPECIMEN_LENGTH + 2 * SPECIMEN_MARGIN,
      h: 2 * (STROKE_SPECIMEN_REACH + SPECIMEN_MARGIN),
    },
  };
}

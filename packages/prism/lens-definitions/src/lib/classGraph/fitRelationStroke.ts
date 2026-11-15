import { STROKE_MIN_WIDTH, ZERO_STROKE_DASH } from "./constants.js";
import fitArrowheads from "./fitArrowheads.js";
import type { RelationStroke, StrokeWeight } from "./types.js";

/**
 * Fit a relation's line to the stroke it is drawn at: its width, its dash
 * where no statement instantiates it, and its path and heads fitted so a
 * heavy line ends inside its head. A relation no store counts, as a
 * legend's specimen with no stroke of its own, keeps the lightest solid
 * stroke and the layout's path. The canvas and the legend draw every
 * relation's line through it, so the two cannot drift.
 *
 * @param d - The relation's path, one subpath whose ends lie at its tips.
 * @param heads - Its arrowheads, each a triangle from its tip.
 * @param weight - The stroke its weight calls for, if it has one.
 * @returns The path, heads, width and dash to draw.
 */
export default function fitRelationStroke(
  d: string,
  heads: readonly string[],
  weight: StrokeWeight | undefined,
): RelationStroke {
  if (weight === undefined) {
    return { d, heads, width: STROKE_MIN_WIDTH, dash: undefined };
  }
  return {
    ...fitArrowheads(d, heads, weight.width),
    width: weight.width,
    dash: weight.dashed ? ZERO_STROKE_DASH : undefined,
  };
}

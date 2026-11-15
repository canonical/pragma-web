import {
  formatPathData,
  type PathCommand,
  type Point,
  parsePathData,
  requireAt,
} from "@canonical/prism-core";
import { HEAVY_HEAD_SIZES } from "./constants.js";
import type { StrokeWidth } from "./types.js";

/**
 * Fit a relation's arrowheads to its stroke: from 4px each head grows to
 * its `HEAVY_HEAD_SIZES` size about its tip, and the line stops its own
 * width short of each tip, where the head is as wide as the line, so a
 * heavy line ends inside its head instead of overrunning the point. A
 * lighter stroke keeps the layout's path and heads. Every coordinate stays
 * an integer, and the tips, where the heads touch their boxes, never move.
 *
 * @param d - The relation's path, one subpath whose ends lie at its tips.
 * @param heads - Its arrowheads, each a triangle from its tip.
 * @param width - The stroke the relation is drawn at.
 * @returns The path and heads to draw.
 * @throws When the path is not one subpath: a relation is one line.
 */
export default function fitArrowheads(
  d: string,
  heads: readonly string[],
  width: StrokeWidth,
): { readonly d: string; readonly heads: readonly string[] } {
  const size = HEAVY_HEAD_SIZES[width];
  if (size === undefined || heads.length === 0) return { d, heads };
  const subpaths = parsePathData(d);
  if (subpaths.length !== 1) {
    throw new Error(`a relation is one subpath, not ${subpaths.length}`);
  }
  const { start, segments } = requireAt(subpaths, 0);
  const tips = heads.map(readTip);
  // Each end that is a head's tip steps back towards the head's base.
  const shorten = ([x, y]: Point): Point => {
    const tip = tips.find(({ at }) => at[0] === x && at[1] === y);
    if (tip === undefined) return [x, y];
    return [tip.pointsRight ? x - width : x + width, y];
  };
  const last = segments.length - 1;
  const commands: PathCommand[] = [
    ["M", ...shorten(start)],
    ...segments.map((segment, index): PathCommand => {
      const points = segment.points.slice(1);
      const end = index === last ? shorten(requireAt(points, -1)) : undefined;
      const [p1, p2, p3] = points;
      if (segment.kind === "cubic" && p1 && p2 && p3) {
        return ["C", ...p1, ...p2, ...(end ?? p3)];
      }
      return ["L", ...(end ?? requireAt(points, -1))];
    }),
  ];
  return {
    d: formatPathData(commands),
    heads: tips.map(({ at: [x, y], pointsRight }) =>
      formatPathData([
        ["M", x, y],
        ["L", pointsRight ? x - size : x + size, y - size / 2],
        ["V", y + size / 2],
        ["L", x, y],
      ]),
    ),
  };
}

/**
 * Read an arrowhead's tip, where its path starts, and which way it points:
 * right when its base lies left of the tip.
 */
function readTip(head: string): {
  readonly at: Point;
  readonly pointsRight: boolean;
} {
  const { start, segments } = requireAt(parsePathData(head), 0);
  const [baseX] = requireAt(requireAt(segments, 0).points, 1);
  return { at: start, pointsRight: baseX < start[0] };
}

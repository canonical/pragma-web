import {
  COLLISION_MARGIN,
  compareText,
  flattenPath,
  intersectsRect,
  LABEL_HALO,
  LABEL_SIZE,
  measureTextWidth,
  REGION_LABEL_ROW,
  type Rect,
  requireAt,
  requireDefined,
} from "@canonical/prism-core";
import { WEIGHT_LABEL_AT, WEIGHT_LABEL_GAP } from "./constants.js";
import measureRegionHeading from "./measureRegionHeading.js";
import type {
  ClassGraphLayout,
  DrawnEdgeLabel,
  LaidOutEdge,
  PlacedWeightLabel,
} from "./types.js";

type Point = readonly [number, number];

/** A straight stretch of a drawn line. */
interface Run {
  readonly from: Point;
  readonly to: Point;
}

/** List the straight stretches of a path, its curves flattened. */
function listRuns(d: string): Run[] {
  return flattenPath(d).flatMap((points) =>
    points.slice(1).map((to, index) => ({
      from: requireAt(points, index) as Point,
      to: to as Point,
    })),
  );
}

/** Whether a stretch passes through a box or along its edge. */
function touchesRun(box: Rect, { from, to }: Run): boolean {
  return (
    Math.min(from[0], to[0]) <= box.x + box.w &&
    box.x <= Math.max(from[0], to[0]) &&
    Math.min(from[1], to[1]) <= box.y + box.h &&
    box.y <= Math.max(from[1], to[1])
  );
}

/** The box that holds every point of a path: an arrowhead's extent. */
function boundPath(d: string): Rect {
  const points = flattenPath(d).flat();
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** The point at a share of a run of stretches' length, from its start. */
function findPointAt(runs: readonly Run[], share: number): Point {
  const lengths = runs.map(({ from, to }) =>
    Math.hypot(to[0] - from[0], to[1] - from[1]),
  );
  let rest = share * lengths.reduce((sum, length) => sum + length, 0);
  for (const [index, run] of runs.entries()) {
    const length = requireAt(lengths, index);
    if (rest <= length || index === runs.length - 1) {
      const part = length === 0 ? 0 : Math.min(1, rest / length);
      return [
        run.from[0] + (run.to[0] - run.from[0]) * part,
        run.from[1] + (run.to[1] - run.from[1]) * part,
      ];
    }
    rest -= length;
  }
  return requireAt(runs, 0).from;
}

/**
 * The property an edge's count is of: its heaviest relation's, the one
 * whose statements are the bundle's weight; none when the edge counts no
 * statement (a zero edge, dashed, or a legend's specimen).
 */
function findCountedRelation(
  edge: LaidOutEdge,
): { property: string; count: number } | undefined {
  const weight = edge.bundle?.weight;
  if (weight === undefined || weight <= 0) return undefined;
  const relation = requireDefined(
    edge.bundle?.relations.find(
      (candidate) => "count" in candidate && candidate.count === weight,
    ),
    "the relation an edge's weight counts",
  );
  return { property: relation.uri, count: weight };
}

/**
 * Seat each drawn edge label with its count's numeral, clear of the lines:
 * the label with the numeral after it, as one unit, where the label was
 * placed if that unit touches no line; else beside the edge's own line,
 * above, below, left or right of it at its middle, then out towards its
 * ends. A place is clear when it lies inside the viewBox and meets no
 * class's box, no region's label row, no arrowhead, no drawn line (the
 * edge's own included) and no unit seated before it. Where no place
 * holds the unit, the label stays where it was placed and its numeral
 * takes the first clear place right of, left of, above or below it, or
 * none: the inspector's rows still carry the count. A numeral is drawn
 * only for an edge whose weight is above 0, and links to the property
 * whose statements it counts. Labels are seated by edge id and every
 * coordinate is a whole pixel, so the same layout gives the same places.
 *
 * @param layout - The class graph laid out.
 * @param labels - The edge labels drawn, each by its edge id and box.
 * @returns Each label's shift and its numeral, in edge id order.
 */
export default function placeWeightLabels(
  layout: Pick<
    ClassGraphLayout,
    "nodes" | "edges" | "regions" | "viewBox" | "drilled"
  >,
  labels: readonly DrawnEdgeLabel[],
): PlacedWeightLabel[] {
  const edges = new Map(layout.edges.map((edge) => [edge.id, edge]));
  const runs = layout.edges.flatMap((edge) => listRuns(edge.d));
  const obstacles: Rect[] = [
    ...[...layout.nodes.values()].map((node) => ({
      x: node.x - COLLISION_MARGIN,
      y: node.y - COLLISION_MARGIN,
      w: node.w + 2 * COLLISION_MARGIN,
      h: node.h + 2 * COLLISION_MARGIN,
    })),
    // A region's heading, not its whole row: the rule under it is a line
    // no label crosses either.
    ...layout.regions.map((region) => ({
      x: region.x,
      y: region.y,
      w: measureRegionHeading(
        region.prefix,
        region.members,
        layout.drilled === region.prefix,
      ),
      h: REGION_LABEL_ROW,
    })),
    ...layout.regions.map((region) => ({
      x: region.x,
      y: region.y,
      w: region.w,
      h: 1,
    })),
    ...layout.edges.flatMap((edge) =>
      edge.heads.map((head) => {
        const box = boundPath(head);
        return {
          x: box.x - WEIGHT_LABEL_GAP,
          y: box.y - WEIGHT_LABEL_GAP,
          w: box.w + 2 * WEIGHT_LABEL_GAP,
          h: box.h + 2 * WEIGHT_LABEL_GAP,
        };
      }),
    ),
  ];
  const { viewBox } = layout;
  const seated: Rect[] = [];
  const isClear = (box: Rect): boolean =>
    box.x >= viewBox.x &&
    box.y >= viewBox.y &&
    box.x + box.w <= viewBox.x + viewBox.w &&
    box.y + box.h <= viewBox.y + viewBox.h &&
    !obstacles.some((obstacle) => intersectsRect(obstacle, box)) &&
    !runs.some((run) => touchesRun(box, run)) &&
    !seated.some((other) => intersectsRect(other, box));
  // Each label against the others as first placed, so one seated later
  // does not cover one not yet moved.
  seated.push(...labels.map(({ box }) => box));
  return [...labels]
    .sort((a, b) => compareText(a.edge, b.edge))
    .map((label): PlacedWeightLabel => {
      const edge = requireDefined(edges.get(label.edge), "a label's edge");
      const counted = findCountedRelation(edge);
      const own = seated.indexOf(label.box);
      seated.splice(own, 1);
      const nw = counted
        ? Math.ceil(
            measureTextWidth(String(counted.count), "regular", LABEL_SIZE),
          ) +
          2 * LABEL_HALO
        : 0;
      const nh = LABEL_SIZE + 2 * LABEL_HALO;
      const gap = counted ? WEIGHT_LABEL_GAP : 0;
      const w = label.box.w + gap + nw;
      const h = Math.max(label.box.h, counted ? nh : 0);
      // The unit's top-left corners to try: where the label was placed,
      // then beside the edge's own line; the numeral after the label,
      // then before it.
      const ownRuns = listRuns(edge.d);
      const around = (cx: number, cy: number, bw: number, bh: number) => [
        { x: cx - bw / 2, y: cy - WEIGHT_LABEL_GAP - bh },
        { x: cx - bw / 2, y: cy + WEIGHT_LABEL_GAP },
        { x: cx - WEIGHT_LABEL_GAP - bw, y: cy - bh / 2 },
        { x: cx + WEIGHT_LABEL_GAP, y: cy - bh / 2 },
      ];
      const besideLine = (bw: number, bh: number) =>
        WEIGHT_LABEL_AT.flatMap((share) => {
          const [px, py] = findPointAt(ownRuns, share);
          return around(px, py, bw, bh);
        });
      // Each corner with the numeral after the label, then before it.
      const corners = [
        { x: label.box.x, y: label.box.y + label.box.h / 2 - h / 2 },
        ...besideLine(w, h),
      ].flatMap(({ x, y }) => [
        { x, y, after: true },
        { x: x - (counted ? gap + nw : 0), y, after: false },
      ]);
      const unit = corners
        .map(({ x, y, after }) => ({
          x: Math.round(x),
          y: Math.round(y),
          w,
          h,
          after,
        }))
        .find(isClear);
      // The label sits at the unit's left, or after the numeral, centred on
      // the unit's height.
      const dx =
        unit === undefined
          ? 0
          : unit.x + (unit.after ? 0 : gap + nw) - label.box.x;
      const dy =
        unit === undefined
          ? 0
          : unit.y + Math.round((h - label.box.h) / 2) - label.box.y;
      const moved = { ...label.box, x: label.box.x + dx, y: label.box.y + dy };
      seated.push(unit ?? moved);
      if (counted === undefined) {
        return { edge: label.edge, dx, dy, numeral: undefined };
      }
      const middle = moved.y + moved.h / 2;
      const numeralAt =
        unit !== undefined
          ? {
              x: unit.after ? moved.x + moved.w + gap : unit.x,
              y: Math.round(middle - nh / 2),
            }
          : [
              { x: moved.x + moved.w + gap, y: middle - nh / 2 },
              { x: moved.x - gap - nw, y: middle - nh / 2 },
              ...around(moved.x + moved.w / 2, moved.y, nw, nh).slice(0, 1),
              ...around(moved.x + moved.w / 2, moved.y + moved.h, nw, nh).slice(
                1,
                2,
              ),
              ...besideLine(nw, nh),
            ]
              .map(({ x, y }) => ({
                x: Math.round(x),
                y: Math.round(y),
                w: nw,
                h: nh,
              }))
              .find(isClear);
      if (numeralAt === undefined) {
        return { edge: label.edge, dx, dy, numeral: undefined };
      }
      const box = { x: numeralAt.x, y: numeralAt.y, w: nw, h: nh };
      if (unit === undefined) seated.push(box);
      return {
        edge: label.edge,
        dx,
        dy,
        numeral: {
          ...counted,
          box,
          cx: box.x + nw / 2,
          cy: box.y + nh / 2,
        },
      };
    });
}

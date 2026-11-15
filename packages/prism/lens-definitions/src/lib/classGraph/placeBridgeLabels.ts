import {
  COLLISION_MARGIN,
  compareText,
  intersectsRect,
  LABEL_HALO,
  measureTextWidth,
  orderBy,
  parsePathData,
  REGION_LABEL_ROW,
  type Rect,
  requireDefined,
} from "@canonical/prism-core";
import type { Translate } from "../i18n/index.js";
import {
  BRIDGE_LABEL_NAMES,
  BRIDGE_LABEL_SEPARATOR,
  BRIDGE_LABEL_SIZE,
} from "./constants.js";
import type { BridgeLabel, ClassGraphLayout } from "./types.js";

/**
 * Place each bridge's label at rest: the names of its relations, or how
 * many there are past two, at a region prefix's size, centred on the
 * first place along its route that keeps it clear of every box, every
 * region's label row, the viewBox's edge and every label placed before
 * it: the middle of its longest horizontal run (the gap between two
 * shelves, or a channel), then of its shorter ones, then a quarter along
 * from either end of each, then the same along its vertical runs, then
 * each corner of the route in turn, then just above or below a
 * horizontal run, where two bridges share one. A bridge with no clear
 * place is left to the inspector. Bridges are placed by
 * edge id and every centre is rounded to a whole pixel, so the same
 * layout always gives the same labels.
 *
 * @param layout - The class graph laid out.
 * @param t - The translator, for how "‹n› relations" reads.
 * @returns The labels placed, by edge id.
 */
export default function placeBridgeLabels(
  layout: ClassGraphLayout,
  t: Translate,
): readonly BridgeLabel[] {
  const obstacles: readonly Rect[] = [
    ...[...layout.nodes.values()].map((node) => ({
      x: node.x - COLLISION_MARGIN,
      y: node.y - COLLISION_MARGIN - node.loopExtent,
      w: node.w + 2 * COLLISION_MARGIN + node.loopExtent,
      h: node.h + 2 * COLLISION_MARGIN + node.loopExtent,
    })),
    ...layout.regions.map((region) => ({
      x: region.x,
      y: region.y,
      w: region.w,
      h: REGION_LABEL_ROW,
    })),
  ];
  const { viewBox } = layout;
  const placed: BridgeLabel[] = [];
  const bridges = layout.edges
    .filter((edge) => edge.bridge === true)
    .sort((a, b) => compareText(a.id, b.id));
  for (const edge of bridges) {
    const { relations } = requireDefined(edge.bundle, "a bridge's bundle");
    const text =
      relations.length > BRIDGE_LABEL_NAMES
        ? t("well.relations.count", { count: relations.length })
        : relations
            .map((relation) => relation.label)
            .join(BRIDGE_LABEL_SEPARATOR);
    const w =
      Math.ceil(measureTextWidth(text, "regular", BRIDGE_LABEL_SIZE)) +
      2 * LABEL_HALO;
    const h = BRIDGE_LABEL_SIZE + 2 * LABEL_HALO;
    // Where the label may sit: along the route's horizontal runs (their
    // middles, longest first, then a quarter from either end), then its
    // vertical runs alike, then its corners, in route order, then just
    // beside its horizontal runs.
    const segments = parsePathData(edge.d).flatMap(({ segments }) => segments);
    const runsOf = (axis: 0 | 1) =>
      segments
        .flatMap((segment, index) => {
          const [from, to] = segment.points;
          return segment.kind === "line" &&
            from !== undefined &&
            to !== undefined &&
            from[1 - axis] === to[1 - axis] &&
            from[axis] !== to[axis]
            ? [
                ...[2, 1, 3].map((quarter) => ({
                  index,
                  quarter,
                  x: from[0] + ((to[0] - from[0]) * quarter) / 4,
                  y: from[1] + ((to[1] - from[1]) * quarter) / 4,
                  length: Math.abs(to[axis] - from[axis]),
                })),
              ]
            : [];
        })
        .sort((a, b) =>
          orderBy(
            Number(a.quarter !== 2) - Number(b.quarter !== 2),
            b.length - a.length,
            a.index - b.index,
            a.quarter - b.quarter,
          ),
        );
    const corners = segments.flatMap((segment) =>
      segment.points.slice(1).map(([x, y]) => ({ x, y })),
    );
    const across = runsOf(0);
    const runs = [
      ...across,
      ...runsOf(1),
      ...corners.slice(0, -1),
      // Beside a horizontal run, above then below it, where another
      // bridge's label already sits on a run they share.
      ...across.flatMap(({ x, y }) => [
        { x, y: y - h },
        { x, y: y + h },
      ]),
    ];
    const chosen = runs
      .map(({ x, y }) => {
        const cx = Math.round(x);
        const cy = Math.round(y);
        return {
          cx,
          cy,
          box: { x: cx - Math.ceil(w / 2), y: cy - Math.ceil(h / 2), w, h },
        };
      })
      .find(
        ({ box }) =>
          box.x >= viewBox.x &&
          box.y >= viewBox.y &&
          box.x + box.w <= viewBox.x + viewBox.w &&
          box.y + box.h <= viewBox.y + viewBox.h &&
          !obstacles.some((obstacle) => intersectsRect(obstacle, box)) &&
          !placed.some((label) => intersectsRect(label.box, box)),
      );
    if (chosen !== undefined) placed.push({ edge: edge.id, text, ...chosen });
  }
  return placed;
}

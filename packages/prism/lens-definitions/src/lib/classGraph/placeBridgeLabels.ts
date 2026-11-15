import {
  COLLISION_MARGIN,
  compareText,
  flattenPath,
  intersectsRect,
  LABEL_HALO,
  measureTextWidth,
  parsePathData,
  REGION_LABEL_ROW,
  type Rect,
  requireDefined,
  requireEntry,
} from "@canonical/prism-core";
import type { Translate } from "../i18n/index.js";
import {
  BRIDGE_LABEL_NAMES,
  BRIDGE_LABEL_SEPARATOR,
  BRIDGE_LABEL_SIZE,
  BRIDGE_LABEL_STEP,
  SHELF_GAP,
} from "./constants.js";
import type {
  BridgeLabel,
  BridgeLabelPlacement,
  ClassGraphLayout,
} from "./types.js";

/** A straight stretch of a route, from one point to the next. */
interface Run {
  readonly from: readonly [number, number];
  readonly to: readonly [number, number];
}

/**
 * List the straight stretches of a bridge's path data, in route order: a
 * bridge is drawn of straight lines only.
 */
function listRuns(d: string): Run[] {
  return parsePathData(d)
    .flatMap(({ segments }) => segments)
    .map(({ points: [from, to] }) => ({
      from: requireDefined(from, "a stretch's start"),
      to: requireDefined(to, "a stretch's end"),
    }));
}

/**
 * List the straight stretches of a relation's path data: its curves
 * flattened, so a box that meets the stroke meets one of them.
 */
function listStrokeRuns(d: string): Run[] {
  return flattenPath(d).flatMap((points) =>
    points.slice(1).map((to, index) => ({
      from: requireDefined(points.at(index), "a stretch's start"),
      to,
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

/**
 * Place each bridge's label at rest: the names of its relations, or how
 * many there are past two, at a region prefix's size, on or beside a
 * stretch of route that only its bridge runs on, as near its arrowhead as
 * it fits. From the arrowhead back along the route, every few px, it tries
 * the label centred on the route, then beside it (above and below a
 * horizontal stretch, left and right of a vertical one), and keeps the
 * first box clear of every box, every region's label row, the viewBox's
 * edge, every label placed before it, every other bridge's route and
 * every other relation's stroke, so a reader can tell which line a label
 * names. A bridge between two regions side by side whose route is too
 * short to carry its label so carries it under the pair: centred on the
 * bridge, in the band below the two regions, from just under them down
 * by the same few px, clear of the same. A bridge with no such place is
 * omitted, and given the place its
 * label takes when a class at one of its ends is the focus, which fades
 * the other lines: the first clear of every box and region label row,
 * else the one nearest its arrowhead. Bridges are placed by edge id and every centre is
 * a whole pixel, so the same layout always gives the same labels.
 *
 * @param layout - The class graph laid out.
 * @param t - The translator, for how "‹n› relations" reads.
 * @returns The labels placed, by edge id, the bridges omitted, and the
 *   omitted bridges' labels on focus.
 */
export default function placeBridgeLabels(
  layout: ClassGraphLayout,
  t: Translate,
): BridgeLabelPlacement {
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
  const bridges = layout.edges
    .filter((edge) => edge.bridge === true)
    .sort((a, b) => compareText(a.id, b.id));
  const routes = new Map(bridges.map((edge) => [edge.id, listRuns(edge.d)]));
  // Every relation that is not a bridge: its stroke, curves flattened.
  const strokes = layout.edges
    .filter((edge) => edge.kind === "relation" && edge.bridge !== true)
    .flatMap((edge) => listStrokeRuns(edge.d));
  const placed: BridgeLabel[] = [];
  const omitted: string[] = [];
  const onFocus: BridgeLabel[] = [];
  for (const edge of bridges) {
    const bundle = requireDefined(edge.bundle, "a bridge's bundle");
    const { relations } = bundle;
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
    const others = bridges
      .filter((other) => other.id !== edge.id)
      .flatMap((other) => requireEntry(routes, other.id));
    // The route walked from its arrowhead: from its far end, unless its
    // only head is at its start.
    const route = requireEntry(routes, edge.id);
    const walk = bundle.heads.has(bundle.b)
      ? route.map(({ from, to }) => ({ from: to, to: from })).reverse()
      : route;
    // Every few px along each stretch: centred on it, then beside it, with
    // the centre on whole pixels.
    const candidates = walk.flatMap(({ from, to }) => {
      const length = Math.abs(to[0] - from[0]) + Math.abs(to[1] - from[1]);
      const across = from[1] === to[1];
      return Array.from(
        { length: Math.floor(length / BRIDGE_LABEL_STEP) + 1 },
        (_, step) => {
          const share = length === 0 ? 0 : (step * BRIDGE_LABEL_STEP) / length;
          const x = Math.round(from[0] + (to[0] - from[0]) * share);
          const y = Math.round(from[1] + (to[1] - from[1]) * share);
          return across
            ? [
                { cx: x, cy: y },
                { cx: x, cy: y - Math.floor(h / 2) },
                { cx: x, cy: y + Math.ceil(h / 2) },
              ]
            : [
                { cx: x, cy: y },
                { cx: x - Math.floor(w / 2), cy: y },
                { cx: x + Math.ceil(w / 2), cy: y },
              ];
        },
      ).flat();
    });
    // Under the pair of regions side by side the bridge joins, centred on
    // it, in the band below their bottom, down to the next shelf's top.
    const ends = [bundle.a, bundle.b].map(
      (end) => requireEntry(layout.nodes, end).region,
    );
    const pair = layout.regions.filter((region) =>
      ends.includes(region.prefix),
    );
    const [one, two] = pair;
    const sideBySide =
      one !== undefined &&
      two !== undefined &&
      one.y < two.y + two.h &&
      two.y < one.y + one.h;
    const xs = route.flatMap(({ from, to }) => [from[0], to[0]]);
    const under = sideBySide
      ? Array.from(
          {
            length: Math.floor((SHELF_GAP - h) / BRIDGE_LABEL_STEP) + 1,
          },
          (_, step) => ({
            cx: Math.round((Math.min(...xs) + Math.max(...xs)) / 2),
            cy:
              Math.max(one.y + one.h, two.y + two.h) +
              Math.ceil(h / 2) +
              step * BRIDGE_LABEL_STEP,
          }),
        )
      : [];
    const boxes = [...candidates, ...under].map(({ cx, cy }) => ({
      cx,
      cy,
      box: { x: cx - Math.ceil(w / 2), y: cy - Math.ceil(h / 2), w, h },
    }));
    const isInside = (box: Rect): boolean =>
      box.x >= viewBox.x &&
      box.y >= viewBox.y &&
      box.x + box.w <= viewBox.x + viewBox.w &&
      box.y + box.h <= viewBox.y + viewBox.h;
    const isClear = (box: Rect): boolean =>
      !obstacles.some((obstacle) => intersectsRect(obstacle, box));
    const chosen = boxes.find(
      ({ box }) =>
        isInside(box) &&
        isClear(box) &&
        !placed.some((label) => intersectsRect(label.box, box)) &&
        !others.some((run) => touchesRun(box, run)) &&
        !strokes.some((run) => touchesRun(box, run)),
    );
    if (chosen !== undefined) {
      placed.push({ edge: edge.id, text, ...chosen });
      continue;
    }
    omitted.push(edge.id);
    const focused = requireDefined(
      boxes.find(({ box }) => isClear(box)) ?? boxes.at(0),
      "a place on a bridge's route",
    );
    onFocus.push({ edge: edge.id, text, ...focused });
  }
  return { placed, omitted, onFocus };
}

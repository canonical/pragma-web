import { LATTICE } from "@canonical/prism-core";
import { DESIGN_CANVAS } from "../../src/lib/classGraph/constants.js";
import type { CanvasMeasure, CanvasRelation } from "./types.js";

/** Read a start tag's attributes, by name. */
function readAttributes(tag: string): ReadonlyMap<string, string> {
  return new Map(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(
      ([, name = "", value = ""]) => [name, value],
    ),
  );
}

/** The start tags of the elements `opening` begins, such as `<g class="node`. */
function listTags(svg: string, opening: string): ReadonlyMap<string, string>[] {
  return [...svg.matchAll(new RegExp(`${opening}[ "][^>]*>`, "g"))].map(
    ([tag]) => readAttributes(tag),
  );
}

/**
 * A straight stretch of a bridge's route: down (along an x) or across
 * (along a y), the line it keeps and the span it runs along.
 */
interface BridgeRun {
  readonly down: boolean;
  readonly line: number;
  readonly from: number;
  readonly to: number;
}

/** A bridge's route: its path data, its two ends and its stretches. */
interface BridgeRoute {
  readonly d: string;
  readonly ends: readonly (readonly [number, number])[];
  readonly runs: readonly BridgeRun[];
}

/** Read a bridge's route drawn with absolute `M`, `H` and `V` commands. */
function readBridgeRoute(d: string): BridgeRoute {
  const runs: BridgeRun[] = [];
  let [x, y] = [0, 0];
  const ends: [number, number][] = [];
  for (const [, command, first = "0", second = "0"] of d.matchAll(
    /([MHV])(-?\d+)(?: (-?\d+))?/g,
  )) {
    const value = Number(first);
    if (command === "M") {
      [x, y] = [value, Number(second)];
      ends.push([x, y]);
    } else if (command === "H") {
      runs.push({
        down: false,
        line: y,
        from: Math.min(x, value),
        to: Math.max(x, value),
      });
      x = value;
    } else {
      runs.push({
        down: true,
        line: x,
        from: Math.min(y, value),
        to: Math.max(y, value),
      });
      y = value;
    }
  }
  ends.push([x, y]);
  return { d, ends, runs };
}

/** Whether two spans overlap by more than a point. */
function overlaps(a1: number, a2: number, b1: number, b2: number): boolean {
  return Math.min(a2, b2) > Math.max(a1, b1);
}

/**
 * The sides of a region a route runs beyond, along a stretch of that
 * side: above it, below it, left or right of it.
 */
function listSidesPassed(
  route: BridgeRoute,
  region: {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
  },
): ReadonlySet<string> {
  const sides = new Set<string>();
  for (const run of route.runs) {
    if (
      !run.down &&
      overlaps(run.from, run.to, region.x, region.x + region.w)
    ) {
      if (run.line < region.y) sides.add("top");
      if (run.line > region.y + region.h) sides.add("bottom");
    }
    if (run.down && overlaps(run.from, run.to, region.y, region.y + region.h)) {
      if (run.line < region.x) sides.add("left");
      if (run.line > region.x + region.w) sides.add("right");
    }
  }
  return sides;
}

/**
 * Measure a canvas's served SVG as the graph checks read it, with no
 * browser: the nodes it draws, by kind and in its fullest graph-wide
 * column; its size in bytes and elements; the zoom at which its viewBox
 * fills the design canvas; the nodes and regions whose corner is off the
 * lattice; each relation's stroke, weight and kind; the bridges that run
 * on one line for a stretch; and the bridges that run along three sides
 * of a region they leave or enter.
 */
export default function measureCanvasSvg(svg: string): CanvasMeasure {
  const nodes = listTags(svg, '<g class="node');
  const columns = new Map<string, number>();
  const kinds: Record<string, number> = {};
  for (const node of nodes) {
    const col = node.get("data-col") ?? "";
    columns.set(col, (columns.get(col) ?? 0) + 1);
    const kind = node.get("data-kind") ?? "";
    kinds[kind] = (kinds[kind] ?? 0) + 1;
  }
  const [x = 0, y = 0, w = 0, h = 0] = (
    /viewBox="([^"]+)"/.exec(svg)?.at(1) ?? ""
  )
    .split(" ")
    .map(Number);
  const isOffLattice = (tag: ReadonlyMap<string, string>): boolean =>
    Number(tag.get("data-x")) % LATTICE !== 0 ||
    Number(tag.get("data-y")) % LATTICE !== 0;
  const offLattice = [
    ...nodes.filter(isOffLattice).map((node) => node.get("data-id") ?? ""),
    ...listTags(svg, '<g class="region')
      .filter(isOffLattice)
      .map((region) => `region ${region.get("data-ns") ?? ""}`),
  ];
  const relations: CanvasRelation[] = listTags(
    svg,
    '<path class="relation',
  ).map((path) => {
    const classes = (path.get("class") ?? "").split(" ");
    const weight = path.get("data-weight");
    return {
      from: path.get("data-from") ?? "",
      to: path.get("data-to") ?? "",
      weight: weight === undefined ? undefined : Number(weight),
      width: Number(path.get("stroke-width")),
      dashed: path.has("stroke-dasharray"),
      bridge: classes.includes("is-bridge"),
      focus: classes.includes("is-focus"),
    };
  });
  const bridges = listTags(svg, '<path class="relation')
    .filter((path) =>
      (path.get("class") ?? "").split(" ").includes("is-bridge"),
    )
    .map((path) => readBridgeRoute(path.get("d") ?? ""));
  const sharedBridgeLines = bridges.flatMap((route, index) =>
    bridges
      .slice(index + 1)
      .filter((other) =>
        route.runs.some((run) =>
          other.runs.some(
            (otherRun) =>
              otherRun.down === run.down &&
              otherRun.line === run.line &&
              overlaps(run.from, run.to, otherRun.from, otherRun.to),
          ),
        ),
      )
      .map((other) => `${route.d} and ${other.d}`),
  );
  const regions = listTags(svg, '<g class="region').map((region) => ({
    ns: region.get("data-ns") ?? "",
    x: Number(region.get("data-x")),
    y: Number(region.get("data-y")),
    w: Number(region.get("data-w")),
    h: Number(region.get("data-h")),
  }));
  const framingBridges = bridges.flatMap((route) =>
    regions
      .filter(
        (region) =>
          route.ends.some(
            ([x, y]) =>
              x >= region.x &&
              x <= region.x + region.w &&
              y >= region.y &&
              y <= region.y + region.h,
          ) && listSidesPassed(route, region).size >= 3,
      )
      .map((region) => `${route.d} round ${region.ns}`),
  );
  return {
    nodes: nodes.length,
    kinds,
    largestColumn: Math.max(0, ...columns.values()),
    bytes: new TextEncoder().encode(svg).length,
    elements: svg.match(/<[a-zA-Z]/g)?.length ?? 0,
    viewBox: { x, y, w, h },
    openingZoom: Math.min(DESIGN_CANVAS.w / w, DESIGN_CANVAS.h / h),
    offLattice,
    relations,
    bridges: relations.filter((relation) => relation.bridge).length,
    bridgeLabels: svg.match(/class="edge-label is-bridge"/g)?.length ?? 0,
    sharedBridgeLines,
    framingBridges,
  };
}

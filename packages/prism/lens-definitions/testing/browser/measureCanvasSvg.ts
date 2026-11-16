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

/** An arch's top: its route's path data, the line it runs on and its span. */
interface ArchTop {
  readonly d: string;
  readonly y: number;
  readonly from: number;
  readonly to: number;
}

/**
 * Read an arch from a bridge's route: one that leaves its port across,
 * rises to a line above both its ports, runs along it and comes down to
 * the other port; any other route is none.
 */
function readArchTop(d: string): ArchTop | undefined {
  const match =
    /^M(-?\d+) (-?\d+)H(-?\d+)V(-?\d+)H(-?\d+)V(-?\d+)H(-?\d+)$/.exec(d);
  if (match === null) return undefined;
  const [, , portA, exit, top, entry, portB] = match.map(Number);
  if (
    portA === undefined ||
    exit === undefined ||
    top === undefined ||
    entry === undefined ||
    portB === undefined ||
    top >= portA ||
    top >= portB
  ) {
    return undefined;
  }
  return { d, y: top, from: Math.min(exit, entry), to: Math.max(exit, entry) };
}

/**
 * Measure a canvas's served SVG as the graph checks read it, with no
 * browser: the nodes it draws, by kind and in its fullest graph-wide
 * column; its size in bytes and elements; the zoom at which its viewBox
 * fills the design canvas; the nodes and regions whose corner is off the
 * lattice; each relation's stroke, weight and kind; and the arches over
 * a shelf whose tops run on one line.
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
  const arches = listTags(svg, '<path class="relation')
    .filter((path) =>
      (path.get("class") ?? "").split(" ").includes("is-bridge"),
    )
    .flatMap((path) => readArchTop(path.get("d") ?? "") ?? []);
  const sharedArchLines = arches.flatMap((arch, index) =>
    arches
      .slice(index + 1)
      .filter(
        (other) =>
          other.y === arch.y &&
          Math.min(arch.to, other.to) > Math.max(arch.from, other.from),
      )
      .map((other) => `${arch.d} and ${other.d}`),
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
    sharedArchLines,
  };
}

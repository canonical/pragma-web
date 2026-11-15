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
 * Measure a canvas's served SVG as the graph checks read it, with no
 * browser: the nodes it draws, by kind and in its fullest graph-wide
 * column; its size in bytes and elements; the zoom at which its viewBox
 * fills the design canvas; the nodes and regions whose corner is off the
 * lattice; and each relation's stroke, weight and kind.
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
  };
}

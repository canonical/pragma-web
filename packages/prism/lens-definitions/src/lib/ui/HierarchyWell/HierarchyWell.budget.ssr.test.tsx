import { GRAPH_BUDGET } from "@canonical/prism-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createAllNamespacesFilter from "../../../../testing/createAllNamespacesFilter.js";
import createRouterHarness from "../../../../testing/createRouterHarness.js";
import { FOUR_NAMESPACE_GRAPH } from "../../../../testing/fixtures.js";
import metroGraph from "../../../../testing/records/metroGraph.js";
import ontologyGraph from "../../../../testing/records/ontologyGraph.js";
import {
  BRIDGE_LABEL_SIZE,
  DESIGN_CANVAS,
} from "../../classGraph/constants.js";
import layOutClassGraph from "../../classGraph/layOutClassGraph.js";
import type { ClassGraphInput } from "../../classGraph/types.js";
import HierarchyWell from "./HierarchyWell.js";

/** The canvas's SVG of the well rendered at rest: its outermost `<svg>`. */
function renderCanvas(input: ClassGraphInput): string {
  const layout = layOutClassGraph(input, { budget: GRAPH_BUDGET });
  const terms = new Map(
    input.classes.map((klass) => [
      klass.uri,
      `${klass.prefix}:${klass.uri.split(/[#/:]/).at(-1)}`,
    ]),
  );
  const html = renderToString(
    createRouterHarness(
      <HierarchyWell
        filter={createAllNamespacesFilter(
          layout.regions.map((region) => region.prefix),
        )}
        hoverCentre={undefined}
        layout={layout}
        onHoverTerm={() => {}}
        term={undefined}
        terms={terms}
      />,
    ),
  );
  const start = html.indexOf("<svg", html.indexOf("graph-canvas desktop"));
  let depth = 0;
  for (const match of html.slice(start).matchAll(/<svg|<\/svg>/g)) {
    depth += match[0] === "<svg" ? 1 : -1;
    if (depth === 0) {
      return html.slice(start, start + match.index + "</svg>".length);
    }
  }
  throw new Error("the canvas's svg does not close");
}

/** What the tour's graph measure reads from a canvas's SVG. */
function measureCanvas(svg: string) {
  const nodes = [...svg.matchAll(/<g class="node[ "][^>]*data-col="(\d+)"/g)];
  const columns = new Map<string, number>();
  for (const [, col = ""] of nodes) {
    columns.set(col, (columns.get(col) ?? 0) + 1);
  }
  const [, w = "0", h = "0"] =
    svg.match(/viewBox="-?[\d.]+ -?[\d.]+ ([\d.]+) ([\d.]+)"/) ?? [];
  return {
    nodes: nodes.length,
    largestColumn: Math.max(...columns.values()),
    bytes: new TextEncoder().encode(svg).length,
    elements: svg.match(/<[a-zA-Z]/g)?.length ?? 0,
    openingZoom: Math.min(
      DESIGN_CANVAS.w / Number(w),
      DESIGN_CANVAS.h / Number(h),
    ),
    bridgeLabels: svg.match(/class="edge-label is-bridge"/g)?.length ?? 0,
  };
}

/**
 * The relations the records hold whose ends lie in two namespaces, or
 * whose range no class of the records holds: the bridges the provider
 * serves.
 */
function countServedBridges(input: ClassGraphInput): number {
  const prefixOf = new Map(
    input.classes.map((klass) => [klass.uri, klass.prefix]),
  );
  return input.relations.filter(
    (relation) =>
      relation.domain !== null &&
      relation.range !== null &&
      prefixOf.has(relation.domain) &&
      prefixOf.get(relation.domain) !== prefixOf.get(relation.range),
  ).length;
}

describe("HierarchyWell SSR within the graph budget at rest", () => {
  it.each([
    ["the docs records", ontologyGraph, 18, 5],
    ["the docs site's four namespaces", FOUR_NAMESPACE_GRAPH, 20, 5],
    ["the metro's records", metroGraph, 16, 4],
  ])(
    "draws %s within the drawn nodes, the band, the bytes and the elements",
    (_, input, nodes, largestColumn) => {
      const measure = measureCanvas(renderCanvas(input));
      expect(measure).toMatchObject({ nodes, largestColumn });
      expect(measure.nodes).toBeLessThanOrEqual(GRAPH_BUDGET.drawnNodesMax);
      expect(measure.largestColumn).toBeLessThanOrEqual(
        GRAPH_BUDGET.bandMembersMax,
      );
      expect(measure.bytes).toBeLessThanOrEqual(GRAPH_BUDGET.svgBytesMax);
      expect(measure.elements).toBeLessThanOrEqual(GRAPH_BUDGET.svgElementsMax);
    },
  );

  it.each([
    ["the docs records", ontologyGraph, 2],
    ["the metro's records", metroGraph, 3],
  ])(
    "labels every bridge of %s at rest, as many as the records serve, at 12px at least at the opening zoom",
    (_, input, served) => {
      const measure = measureCanvas(renderCanvas(input));
      expect(countServedBridges(input)).toBe(served);
      expect(measure.bridgeLabels).toBe(served);
      expect(BRIDGE_LABEL_SIZE * measure.openingZoom).toBeGreaterThanOrEqual(
        GRAPH_BUDGET.labelPxMin,
      );
    },
  );
});

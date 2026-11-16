import { createTranslator } from "@canonical/i18n-core";
import { GRAPH_BUDGET } from "@canonical/prism-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  measureCanvasSvg,
  sliceCanvasSvg,
} from "../../../../testing/browser/index.js";
import createAllNamespacesFilter from "../../../../testing/createAllNamespacesFilter.js";
import createRouterHarness from "../../../../testing/createRouterHarness.js";
import {
  defineClass,
  FOUR_NAMESPACE_GRAPH,
} from "../../../../testing/fixtures.js";
import metroGraph from "../../../../testing/records/metroGraph.js";
import ontologyGraph from "../../../../testing/records/ontologyGraph.js";
import chooseAddressDrill from "../../classGraph/chooseAddressDrill.js";
import { BRIDGE_LABEL_SIZE } from "../../classGraph/constants.js";
import layOutClassGraph from "../../classGraph/layOutClassGraph.js";
import placeBridgeLabels from "../../classGraph/placeBridgeLabels.js";
import type { ClassGraphInput } from "../../classGraph/types.js";
import { MESSAGES } from "../../i18n/index.js";
import HierarchyWell from "./HierarchyWell.js";

/**
 * The docs records beside a namespace of 31 classes of their own, five
 * layers deep and as wide as the docs site's `surface`: opened, it leaves
 * the other namespaces' boxes and both stubs on one shelf below it.
 */
const SITE_LIKE_GRAPH: ClassGraphInput = {
  classes: [
    ...ontologyGraph.classes,
    ...Array.from({ length: 31 }, (_, index) =>
      defineClass(`surface:C${index}`, `Surface Class ${index}`, {
        ...(index === 0
          ? {}
          : { superclass: `surface:C${Math.floor((index - 1) / 2)}` }),
      }),
    ),
  ],
  relations: ontologyGraph.relations,
};

/**
 * The canvas's SVG of the well rendered at rest, or with a namespace
 * drilled: its outermost `<svg>`.
 */
function renderCanvas(input: ClassGraphInput, drill?: string): string {
  const layout = layOutClassGraph(input, {
    budget: GRAPH_BUDGET,
    ...(drill === undefined ? {} : { drill }),
  });
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
  return sliceCanvasSvg(html);
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
      const measure = measureCanvasSvg(renderCanvas(input));
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
    ["the docs records", ontologyGraph],
    ["the docs site's four namespaces", FOUR_NAMESPACE_GRAPH],
    ["the metro's records", metroGraph],
  ])(
    "draws %s with each namespace drilled within the drawn nodes, the band, the bytes and the elements",
    (_, input) => {
      for (const prefix of new Set(input.classes.map((k) => k.prefix))) {
        const measure = measureCanvasSvg(renderCanvas(input, prefix));
        expect(measure.nodes, prefix).toBeLessThanOrEqual(
          GRAPH_BUDGET.drawnNodesMax,
        );
        expect(measure.largestColumn, prefix).toBeLessThanOrEqual(
          GRAPH_BUDGET.bandMembersMax,
        );
        expect(measure.bytes, prefix).toBeLessThanOrEqual(
          GRAPH_BUDGET.svgBytesMax,
        );
        expect(measure.elements, prefix).toBeLessThanOrEqual(
          GRAPH_BUDGET.svgElementsMax,
        );
      }
    },
  );

  // The docs records' box and stub are neighbours on one shelf: their
  // bridge crosses the gap between them, too short for a label beside it,
  // so its label sits under the pair.
  it.each([
    ["the docs records", ontologyGraph, 2],
    ["the metro's records", metroGraph, 3],
  ])(
    "labels every bridge of %s at rest, as many as the records serve, at 12px at least at the opening zoom",
    (_, input, served) => {
      const measure = measureCanvasSvg(renderCanvas(input));
      expect(countServedBridges(input)).toBe(served);
      expect(measure.bridgeLabels).toBe(served);
      const placement = placeBridgeLabels(
        layOutClassGraph(input, { budget: GRAPH_BUDGET }),
        createTranslator("en", MESSAGES),
      );
      expect(placement.placed).toHaveLength(served);
      expect(placement.omitted).toEqual([]);
      expect(placement.onFocus).toEqual([]);
      expect(BRIDGE_LABEL_SIZE * measure.openingZoom).toBeGreaterThanOrEqual(
        GRAPH_BUDGET.labelPxMin,
      );
    },
  );

  // A bridge is drawn per pair of drawn ends, whatever number of relations
  // it bundles: each is named at rest, past the drawing's bounds or under
  // the pair it joins where its route has no room, in every opened view.
  it.each([
    ["the docs records", ontologyGraph],
    ["the docs site's four namespaces", FOUR_NAMESPACE_GRAPH],
    ["the metro's records", metroGraph],
  ])(
    "names every bridge %s draws at rest, at rest and with each namespace opened, within the drawing's bounds",
    (_, input) => {
      const t = createTranslator("en", MESSAGES);
      for (const drill of [
        undefined,
        ...new Set(input.classes.map((klass) => klass.prefix)),
      ]) {
        const layout = layOutClassGraph(input, {
          budget: GRAPH_BUDGET,
          ...(drill === undefined ? {} : { drill }),
        });
        const bridges = layout.edges.filter((edge) => edge.bridge === true);
        const placement = placeBridgeLabels(layout, t);
        expect(placement.omitted, drill).toEqual([]);
        expect(placement.placed, drill).toHaveLength(bridges.length);
        const { viewBox } = layout;
        for (const { box } of placement.placed) {
          expect(box.x, drill).toBeGreaterThanOrEqual(viewBox.x);
          expect(box.y, drill).toBeGreaterThanOrEqual(viewBox.y);
          expect(box.x + box.w, drill).toBeLessThanOrEqual(
            viewBox.x + viewBox.w,
          );
          expect(box.y + box.h, drill).toBeLessThanOrEqual(
            viewBox.y + viewBox.h,
          );
        }
        expect(measureCanvasSvg(renderCanvas(input, drill)).bridgeLabels).toBe(
          bridges.length,
        );
      }
    },
  );

  // On the docs site, a namespace of 31 classes of its own opened puts the
  // three other namespaces' boxes and both stubs on one shelf: two bridges
  // arch over it, ds to dt:TokenSymbol and anatomy to rdf:List.
  it.each([
    ["the docs records", ontologyGraph],
    ["the docs records beside a wide namespace", SITE_LIKE_GRAPH],
    ["the docs site's four namespaces", FOUR_NAMESPACE_GRAPH],
    ["the metro's records", metroGraph],
  ])(
    "keeps every two arches over a shelf of %s off one line, nested by span, at rest and with each namespace opened",
    (_, input) => {
      let arches = 0;
      for (const drill of [
        undefined,
        ...new Set(input.classes.map((klass) => klass.prefix)),
      ]) {
        const svg = renderCanvas(input, drill);
        expect(measureCanvasSvg(svg).sharedArchLines, drill).toEqual([]);
        arches += [...svg.matchAll(/class="relation[^"]*is-bridge[^>]*>/g)]
          .map(([tag]) => /\bd="([^"]*)"/.exec(tag)?.at(1) ?? "")
          .filter((d) => /^M\S+ \S+H\S+V\S+H\S+V\S+H\S+$/.test(d)).length;
      }
      if (input === SITE_LIKE_GRAPH) expect(arches).toBeGreaterThanOrEqual(2);
    },
  );

  it("draws the metro's records whole at rest with no box to open, and geo drilled with every other namespace a box that opens it", () => {
    const rest = renderCanvas(metroGraph);
    expect(rest).not.toContain('data-kind="region"');
    expect(rest).not.toContain("expand=");
    const drill = chooseAddressDrill(metroGraph, "geo", undefined);
    expect(drill).toBe("geo");
    const drilled = renderCanvas(metroGraph, drill);
    const others = [
      ...new Set(
        metroGraph.classes
          .map((klass) => klass.prefix)
          .filter((prefix) => prefix !== "geo"),
      ),
    ];
    expect(drilled.match(/data-kind="region"/g)).toHaveLength(others.length);
    for (const prefix of others) {
      expect(drilled).toContain(`href="/definitions?expand=${prefix}"`);
    }
    expect(drilled).toMatch(/class="[^"]*way-back"[^>]*href="\/definitions"/);
    expect(drilled).not.toMatch(/data-kind="region"[^>]*role="img"/);
  });
});

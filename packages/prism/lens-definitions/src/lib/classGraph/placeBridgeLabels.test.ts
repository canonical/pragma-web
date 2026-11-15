import { intersectsRect, LATTICE } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import { SHELF_PAIR_GRAPH } from "../../../testing/fixtures.js";
import metroGraph from "../../../testing/records/metroGraph.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import layOutClassGraph from "./layOutClassGraph.js";
import placeBridgeLabels from "./placeBridgeLabels.js";
import type { ClassGraphLayout } from "./types.js";

/** How "‹n› relations" reads in the tests. */
const formatCount = (count: number): string => `${count} relations`;

/** The bridges of a layout and the labels placed on them. */
function placeOn(layout: ClassGraphLayout) {
  return {
    bridges: layout.edges.filter((edge) => edge.bridge === true),
    labels: placeBridgeLabels(layout, formatCount),
  };
}

describe("placeBridgeLabels", () => {
  it("labels a bridge with its relation's name on the route", () => {
    const { labels } = placeOn(layOutClassGraph(SHELF_PAIR_GRAPH));
    expect(labels.map(({ edge, text }) => [edge, text])).toEqual([
      ["rel:aa:A0 bb:B0", "reaches"],
    ]);
  });

  it("labels every bridge of the captured graphs clear of boxes and of each other", () => {
    for (const graph of [ontologyGraph, metroGraph]) {
      const layout = layOutClassGraph(graph);
      const { bridges, labels } = placeOn(layout);
      expect(labels.map((label) => label.edge)).toEqual(
        bridges.map((edge) => edge.id).sort(),
      );
      for (const label of labels) {
        for (const node of layout.nodes.values()) {
          expect(intersectsRect(label.box, node)).toBe(false);
        }
        for (const other of labels) {
          if (other !== label)
            expect(intersectsRect(label.box, other.box)).toBe(false);
        }
        // The label sits on its route, centred on a whole pixel.
        expect(Number.isInteger(label.cx) && Number.isInteger(label.cy)).toBe(
          true,
        );
      }
    }
  });

  it("counts a bridge's relations past two", () => {
    const layout = layOutClassGraph({
      ...SHELF_PAIR_GRAPH,
      relations: ["one", "two", "three"].map((label) => ({
        uri: `aa:${label}`,
        label,
        domain: "aa:A0",
        range: "bb:B0",
        count: 1,
      })),
    });
    expect(placeOn(layout).labels.map((label) => label.text)).toEqual([
      "3 relations",
    ]);
    expect(LATTICE).toBe(16);
  });
});

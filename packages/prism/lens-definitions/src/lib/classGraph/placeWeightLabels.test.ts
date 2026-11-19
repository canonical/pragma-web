import { createTranslator } from "@canonical/i18n-core";
import {
  flattenPath,
  GRAPH_BUDGET,
  intersectsRect,
  placeEdgeLabels,
  type Rect,
  requireDefined,
} from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import metroGraph from "../../../testing/records/metroGraph.js";
import { MESSAGES } from "../i18n/index.js";
import layOutClassGraph from "./layOutClassGraph.js";
import listUndeclaredEdges from "./listUndeclaredEdges.js";
import placeBridgeLabels from "./placeBridgeLabels.js";
import placeWeightLabels from "./placeWeightLabels.js";
import type { ClassGraphLayout, DrawnEdgeLabel } from "./types.js";

const t = createTranslator("en", MESSAGES);
const STATION = "https://metro.example/onto#Station";

/** The labels a canvas draws on a layout with a focus: bridges and focus's. */
function drawLabels(layout: ClassGraphLayout, focus: string): DrawnEdgeLabel[] {
  const bridges = placeBridgeLabels(layout, t).placed;
  const named = new Set(bridges.map((label) => label.edge));
  const focused = placeEdgeLabels(
    layout,
    focus,
    new Set(),
    (count) => t("well.relations.count", { count }),
    (count) => t("well.region.count", { count }),
  ).placed.filter((label) => !named.has(label.edge));
  return [...bridges, ...focused].map(({ edge, box }) => ({ edge, box }));
}

/** Whether a box meets any stretch of a layout's drawn lines. */
function meetsLine(layout: ClassGraphLayout, box: Rect): boolean {
  return layout.edges
    .flatMap((edge) => flattenPath(edge.d))
    .some((points) =>
      points.slice(1).some((to, index) => {
        const from = requireDefined(points.at(index), "a point");
        return (
          Math.min(from[0], to[0]) <= box.x + box.w &&
          box.x <= Math.max(from[0], to[0]) &&
          Math.min(from[1], to[1]) <= box.y + box.h &&
          box.y <= Math.max(from[1], to[1])
        );
      }),
    );
}

/** Whether a box lies inside a layout's viewBox. */
function isInside({ viewBox }: ClassGraphLayout, box: Rect): boolean {
  return (
    box.x >= viewBox.x &&
    box.y >= viewBox.y &&
    box.x + box.w <= viewBox.x + viewBox.w &&
    box.y + box.h <= viewBox.y + viewBox.h
  );
}

describe("placeWeightLabels", () => {
  const layout = layOutClassGraph(metroGraph, {
    budget: GRAPH_BUDGET,
    focus: STATION,
  });
  const labels = drawLabels(layout, STATION);
  const placed = placeWeightLabels(layout, labels);

  it("seats metro:Station's labels and numerals clear of every line, inside the frame", () => {
    expect(placed.length).toBe(labels.length);
    expect(placed.some((entry) => entry.numeral !== undefined)).toBe(true);
    for (const entry of placed) {
      const label = requireDefined(
        labels.find((candidate) => candidate.edge === entry.edge),
        "a label",
      );
      const moved = {
        ...label.box,
        x: label.box.x + entry.dx,
        y: label.box.y + entry.dy,
      };
      expect(isInside(layout, moved)).toBe(true);
      if (entry.numeral === undefined) continue;
      expect(isInside(layout, entry.numeral.box)).toBe(true);
      expect(meetsLine(layout, entry.numeral.box)).toBe(false);
      expect(meetsLine(layout, moved)).toBe(false);
    }
  });

  it("keeps every numeral off the arrowheads and off the classes", () => {
    const heads = layout.edges.flatMap((edge) =>
      edge.heads.flatMap((head) => flattenPath(head).flat()),
    );
    for (const { numeral } of placed) {
      if (numeral === undefined) continue;
      const { box } = numeral;
      expect(
        heads.some(
          ([x, y]) =>
            x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h,
        ),
      ).toBe(false);
      expect(
        [...layout.nodes.values()].some((node) => intersectsRect(node, box)),
      ).toBe(false);
    }
  });

  it("draws an edge's weight and links its heaviest relation's property", () => {
    for (const { edge, numeral } of placed) {
      const bundle = requireDefined(
        layout.edges.find((candidate) => candidate.id === edge)?.bundle,
        "a bundle",
      );
      if (bundle.weight === undefined || bundle.weight === 0) {
        expect(numeral).toBeUndefined();
        continue;
      }
      expect(numeral?.count).toBe(bundle.weight);
      expect(bundle.relations.map((relation) => relation.uri)).toContain(
        numeral?.property,
      );
    }
  });

  it("gives the same places on every call", () => {
    expect(placeWeightLabels(layout, labels)).toEqual(placed);
  });

  it("draws no numeral on a zero edge", () => {
    const zero = layout.edges.find((edge) => edge.bundle?.weight === 0);
    if (zero === undefined) return;
    const [entry] = placeWeightLabels(layout, [
      { edge: zero.id, box: { x: 0, y: 0, w: 1, h: 1 } },
    ]);
    expect(entry?.numeral).toBeUndefined();
  });
});

describe("listUndeclaredEdges", () => {
  it("lists the observed edges no property declares, in reading order", () => {
    const edge = (
      subjectClass: string,
      property: string,
      count: number,
      declared: boolean,
    ) => ({ subjectClass, property, objectClass: "o:Z", count, declared });
    expect(
      listUndeclaredEdges([
        edge("o:B", "o:p", 2, false),
        edge("o:A", "o:q", 1, false),
        edge("o:A", "o:p", 3, false),
        edge("o:A", "o:r", 0, false),
        edge("o:A", "o:s", 5, true),
      ]).map(({ subjectClass, property }) => `${subjectClass} ${property}`),
    ).toEqual(["o:A o:p", "o:A o:q", "o:B o:p"]);
  });
});

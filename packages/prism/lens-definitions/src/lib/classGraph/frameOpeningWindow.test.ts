import {
  GRAPH_BUDGET,
  intersectsRect,
  type Rect,
  requireEntry,
} from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import { FOUR_NAMESPACE_GRAPH } from "../../../testing/fixtures.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import { DESIGN_CANVAS, MIN_FIT } from "./constants.js";
import frameLegibleWindow from "./frameLegibleWindow.js";
import frameOpeningWindow from "./frameOpeningWindow.js";
import layOutClassGraph from "./layOutClassGraph.js";

/** Whether `inner` lies inside `outer`, with a hair's tolerance. */
const holds = (outer: Rect, inner: Rect): boolean =>
  inner.x >= outer.x - 1e-6 &&
  inner.y >= outer.y - 1e-6 &&
  inner.x + inner.w <= outer.x + outer.w + 1e-6 &&
  inner.y + inner.h <= outer.y + outer.h + 1e-6;

/** The docs site's four namespaces: two boxes lead, on the first shelf. */
const layout = layOutClassGraph(FOUR_NAMESPACE_GRAPH, { budget: GRAPH_BUDGET });

/** The boxes on the first shelf, from the left. */
const shelf = [...layout.nodes.values()]
  .filter((node) => node.y < Math.min(...layout.regions.map((r) => r.y + r.h)))
  .sort((a, b) => a.x - b.x);

describe("frameOpeningWindow", () => {
  it("draws two boxes alone on the first shelf, surface first", () => {
    expect(shelf.map((node) => node.uri)).toEqual([
      "region:surface",
      "region:ds",
    ]);
  });

  it("opens a 340 by 900 canvas, narrower than the drawing, on the first shelf's boxes whole and legible", () => {
    const canvas = { w: 340, h: 900 };
    expect(canvas.w / layout.viewBox.w).toBeLessThan(MIN_FIT);
    const window = frameOpeningWindow(layout, canvas);
    expect(window).toMatchObject({ x: layout.viewBox.x, y: layout.viewBox.y });
    expect(window.h / window.w).toBeCloseTo(canvas.h / canvas.w, 10);
    expect(canvas.w / window.w).toBeGreaterThanOrEqual(MIN_FIT);
    expect(shelf.every((node) => holds(window, node))).toBe(true);
    // The legible window alone showed the first box and cut nothing else,
    // at 193%; the boxes lead.
    expect(
      shelf.filter((node) => holds(frameLegibleWindow(layout, canvas), node)),
    ).toHaveLength(1);
  });

  it("opens a 300 by 1142 canvas on as many of the first shelf's boxes as fit, from the left, and no part of the next", () => {
    const canvas = { w: 300, h: 1142 };
    const window = frameOpeningWindow(layout, canvas);
    expect(canvas.w / window.w).toBeGreaterThanOrEqual(MIN_FIT);
    const [first, second] = shelf;
    expect(first && holds(window, first)).toBe(true);
    expect(second && intersectsRect(window, second)).toBe(false);
  });

  it("never cuts a box of the first shelf, and holds them from the left, on any canvas narrower than the drawing", () => {
    for (let w = 200; w <= 600; w += 8) {
      for (const h of [470, 778, 1142]) {
        const canvas = { w, h };
        const window = frameOpeningWindow(layout, canvas);
        expect(canvas.w / window.w).toBeGreaterThanOrEqual(MIN_FIT - 1e-9);
        const held = shelf.map((node) => holds(window, node));
        for (const [index, node] of shelf.entries()) {
          expect(held[index] || !intersectsRect(window, node)).toBe(true);
          if (index > 0 && held[index]) expect(held[index - 1]).toBe(true);
        }
        expect(held.some(Boolean)).toBe(true);
      }
    }
  });

  it("opens on the whole graph where it fits at the legible zoom", () => {
    const docs = layOutClassGraph(ontologyGraph, { budget: GRAPH_BUDGET });
    expect(frameOpeningWindow(docs, DESIGN_CANVAS)).toEqual(docs.viewBox);
    expect(frameOpeningWindow(docs, { w: 448, h: 1142 })).toEqual(docs.viewBox);
  });

  it("opens a term page on the legible window around its class", () => {
    const canvas = { w: 340, h: 900 };
    const arrival = requireEntry(layout.nodes, "region:ds");
    expect(frameOpeningWindow(layout, canvas, arrival)).toEqual(
      frameLegibleWindow(layout, canvas, { arrival }),
    );
  });
});

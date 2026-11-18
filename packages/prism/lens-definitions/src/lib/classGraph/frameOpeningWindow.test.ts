import {
  GRAPH_BUDGET,
  requireDefined,
  requireEntry,
} from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import { FOUR_NAMESPACE_GRAPH } from "../../../testing/fixtures.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import { DESIGN_CANVAS, LEGIBLE_MARGIN, MIN_FIT } from "./constants.js";
import containsRect from "./containsRect.js";
import frameLegibleWindow from "./frameLegibleWindow.js";
import frameOpeningWindow from "./frameOpeningWindow.js";
import layOutClassGraph from "./layOutClassGraph.js";

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

  it("opens a canvas narrower than the drawing at the map's top-left corner, at the legible floor", () => {
    for (const canvas of [
      { w: 340, h: 900 },
      { w: 300, h: 1142 },
      { w: 504, h: 470 },
    ]) {
      expect(
        Math.min(canvas.w / layout.viewBox.w, canvas.h / layout.viewBox.h),
      ).toBeLessThan(MIN_FIT);
      const window = frameOpeningWindow(layout, canvas);
      expect(window).toMatchObject({
        x: layout.viewBox.x,
        y: layout.viewBox.y,
      });
      expect(window.h / window.w).toBeCloseTo(canvas.h / canvas.w, 10);
      expect(canvas.w / window.w).toBeCloseTo(MIN_FIT * LEGIBLE_MARGIN, 10);
    }
  });

  it("holds the first shelf's boxes whole where they fit, and cuts a box its edge crosses", () => {
    const wide = frameOpeningWindow(layout, { w: 504, h: 1142 });
    expect(shelf.every((node) => containsRect(wide, node))).toBe(true);
    const [first, second] = shelf;
    const narrow = frameOpeningWindow(layout, { w: 300, h: 1142 });
    expect(first && containsRect(narrow, first)).toBe(true);
    // The second box runs past the window's right edge: cut there, a sign
    // that the map goes on.
    expect(second && second.x < narrow.x + narrow.w).toBe(true);
    expect(second && containsRect(narrow, second)).toBe(false);
  });

  it("opens wider than the legible window, which left the shelf's second box a pan away", () => {
    const canvas = { w: 340, h: 900 };
    const window = frameOpeningWindow(layout, canvas);
    const legible = frameLegibleWindow(layout, canvas);
    expect(window.w).toBeGreaterThanOrEqual(legible.w);
    expect(shelf.filter((node) => containsRect(window, node)).length).toBe(
      shelf.length,
    );
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

  it("opens a drilled layout by the overview's rule, from its namespace's top-left corner, unless a class is selected on arrival", () => {
    for (const drill of ["surface", "ds", "anatomy", "cs"]) {
      const drilled = layOutClassGraph(FOUR_NAMESPACE_GRAPH, {
        budget: GRAPH_BUDGET,
        drill,
      });
      const region = requireDefined(
        drilled.regions.find((candidate) => candidate.prefix === drill),
        "the drilled region",
      );
      // Packed first: the map's top-left corner is the namespace's own.
      expect(
        drilled.regions.every(
          (other) => other.x >= region.x && other.y >= region.y,
        ),
        drill,
      ).toBe(true);
      for (const canvas of [
        { w: 1000, h: 700 },
        { w: 340, h: 900 },
        { w: 1440, h: 400 },
      ]) {
        const window = frameOpeningWindow(drilled, canvas);
        const frame = drilled.viewBox;
        if (Math.min(canvas.w / frame.w, canvas.h / frame.h) >= MIN_FIT) {
          expect(window, drill).toEqual(
            frameLegibleWindow(drilled, canvas, {}),
          );
          continue;
        }
        // Never zoomed to the namespace: the legible floor, from the
        // map's corner, the namespace's corner in view.
        expect(window, drill).toMatchObject({ x: frame.x, y: frame.y });
        expect(canvas.w / window.w, drill).toBeCloseTo(
          MIN_FIT * LEGIBLE_MARGIN,
          10,
        );
        expect(window.h / window.w).toBeCloseTo(canvas.h / canvas.w, 10);
        expect(window.x + window.w).toBeGreaterThan(region.x);
        expect(window.y + window.h).toBeGreaterThan(region.y);
      }
      const canvas = { w: 1000, h: 700 };
      const arrival = requireDefined(
        [...drilled.nodes.values()].find((node) => node.kind === "region"),
        "a box",
      );
      expect(frameOpeningWindow(drilled, canvas, arrival)).toEqual(
        frameLegibleWindow(drilled, canvas, { arrival }),
      );
    }
  });
});

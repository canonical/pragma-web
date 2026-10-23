// @vitest-environment node

/**
 * The class graph laid out from the real ontology, measured as the graph
 * heuristics' reviewer measures it with no browser: fit, density, gaps,
 * overlaps, crossings against the label-sorted baseline, ports, hubs, rail
 * order and the phone view. The numbers are pinned, so a change to the
 * layout shows here first.
 */

import { describe, expect, it } from "vitest";
import {
  countCrossings,
  countEmptyCells,
  countOverlaps,
  countTouchingTips,
  followsRailOrder,
  measureAreaRatio,
  measureFit,
  measureGaps,
  measurePhone,
  measurePorts,
} from "../../../testing/measureClassGraph.js";
import metroGraph from "../../../testing/records/metroGraph.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import { DESIGN_CANVAS, MIN_FIT } from "../../lib/classGraph/constants.js";
import { measurePathBounds } from "../../lib/classGraph/geometry.js";
import layOutClassGraph from "../../lib/classGraph/layOutClassGraph.js";

const layout = layOutClassGraph(ontologyGraph);

describe("the class graph of the real ontology", () => {
  it("fits the 1440 well only below the legible zoom, says so, and opens on a legible window", () => {
    const fit = measureFit(layout);
    expect(fit.zoom).toBeLessThan(MIN_FIT);
    expect(fit.zoom).toBeCloseTo(0.7151, 4);
    expect(fit.binding).toBe("height");
    expect(fit.otherFill).toBeGreaterThanOrEqual(0.6);
    expect(layout.viewBox).toEqual({ x: -16, y: -16, w: 752, h: 1088 });
    expect(layout.findings).toEqual([
      "G3: fit 0.715 at 48px channels; 0.723 at 32px",
      "G3: opens on a legible window, the rest a pan away",
    ]);
    // The window ends half a lattice step past the ds region's third
    // column, the last whose boxes all end before the legible width, and
    // crosses boxes only at its bottom edge, where more lies below.
    expect(layout.view).toMatchObject({ x: -16, y: -16, w: 536 });
    expect(layout.view.h).toBeCloseTo(
      (536 * DESIGN_CANVAS.h) / DESIGN_CANVAS.w,
      10,
    );
    const zoom = Math.min(
      DESIGN_CANVAS.w / layout.view.w,
      DESIGN_CANVAS.h / layout.view.h,
    );
    expect(zoom).toBeGreaterThanOrEqual(MIN_FIT);
    expect(zoom).toBeCloseTo(1.1007, 4);
    const right = layout.view.x + layout.view.w;
    const bottom = layout.view.y + layout.view.h;
    const inView = [...layout.nodes.values()].filter(
      (node) => node.x < right && node.y < bottom,
    );
    const whole = inView.filter((node) => node.y + node.h <= bottom);
    expect(whole.filter((node) => node.x + node.w > right)).toEqual([]);
    expect(whole).toHaveLength(16);
    expect(
      inView
        .filter((node) => node.y + node.h > bottom)
        .map((node) => node.label)
        .sort(),
    ).toEqual(["Anonymous Node", "Node"]);
  });

  it("covers the canvas densely, with no holes", () => {
    const area = measureAreaRatio(layout);
    expect(area).toBeGreaterThanOrEqual(0.12);
    expect(area).toBeLessThanOrEqual(0.3);
    expect(area).toBeCloseTo(0.1491, 4);
    expect(countEmptyCells(layout)).toBe(1);
  });

  it("keeps 16px within a column, a 48px channel and a wider gap between regions", () => {
    const gaps = measureGaps(layout);
    expect(gaps.withinColumns).toEqual([16]);
    expect(gaps.betweenColumns).toBe(48);
    expect(gaps.medianNearest).toBeLessThanOrEqual(64);
    expect(gaps.interRegion).toBeGreaterThanOrEqual(2 * gaps.intraRegionMedian);
  });

  it("aligns each region's columns flush left on the lattice", () => {
    for (const region of layout.regions) {
      const nodes = [...layout.nodes.values()].filter(
        (node) => node.region === region.prefix,
      );
      expect(new Set(nodes.map((node) => node.x)).size).toBe(region.columns);
    }
    for (const node of layout.nodes.values()) {
      expect([node.x % 16, node.y % 16, node.w % 16]).toEqual([0, 0, 0]);
    }
    expect(layout.regions.map((region) => region.prefix)).toEqual([
      "ds",
      "anatomy",
      "cs",
    ]);
  });

  it("overlaps nothing: no box, no edge through a box, no text over text", () => {
    expect(countOverlaps(layout)).toEqual({
      collisions: 0,
      edgesThroughBoxes: [],
      textOverlaps: 0,
    });
  });

  it("crosses fewer edges than the label-sorted order, and no subclass edges", () => {
    const crossings = countCrossings(layout);
    const baseline = countCrossings(layOutClassGraph(ontologyGraph, 0));
    expect(crossings.total).toBe(14);
    expect(baseline.total).toBe(42);
    expect(crossings.total).toBeLessThanOrEqual(baseline.total);
    expect(crossings.total / crossings.relationPaths).toBeLessThanOrEqual(1);
    expect(crossings.subclass).toBe(0);
  });

  it("spaces ports 4px apart, 8px from corners and clear of the subclass tick", () => {
    expect(measurePorts(layout)).toEqual({
      spacing: 4,
      corner: 8,
      tickOnHub: 4,
      tickElsewhere: 8,
    });
    expect(countTouchingTips(layout)).toEqual({ touching: 33, total: 33 });
  });

  it("draws four buses, six bundles and two loops; four hubs", () => {
    expect(
      layout.edges.filter((edge) => edge.kind === "subclass"),
    ).toHaveLength(4);
    const relations = layout.edges.filter((edge) => edge.kind === "relation");
    expect(relations).toHaveLength(25);
    expect(
      relations.filter((edge) => (edge.bundle?.relations.length ?? 0) > 1),
    ).toHaveLength(6);
    expect(relations.filter((edge) => edge.self === true)).toHaveLength(2);
    expect(
      [...layout.nodes.values()]
        .filter((node) => node.hub)
        .map((node) => node.label)
        .sort(),
    ).toEqual(["Entity", "Node", "UI Block", "UI Element"]);
  });

  it("orders every column as the rail does", () => {
    expect(followsRailOrder(layout)).toBe(true);
  });

  it("fits the phone view in its column, in rail order, two spine ports a row", () => {
    expect(measurePhone(layout)).toEqual({
      maxX: 256,
      inRailOrder: true,
      collisions: 0,
      arcsThroughRows: 0,
      maxSpinePorts: 2,
    });
  });
});

describe("the class graph of the metro ontology", () => {
  const metro = layOutClassGraph(metroGraph);

  // A short, wide graph: one five-column region over two one-column ones.
  // On the 1440 well it fits only by width, below the legible zoom even at
  // 32px channels, and fills too little of the canvas's height; these
  // numbers pin that shape, which the layered recipe keeps on a well this
  // narrow.
  it("fits the 1440 well by its width only, below the legible zoom, and says so", () => {
    const fit = measureFit(metro);
    expect(fit.zoom).toBeLessThan(MIN_FIT);
    expect(fit.zoom).toBeCloseTo(0.7682, 4);
    expect(fit.binding).toBe("width");
    expect(fit.otherFill).toBeCloseTo(0.4266, 4);
    expect(metro.viewBox).toEqual({ x: -16, y: -16, w: 768, h: 432 });
    expect(metro.findings).toEqual([
      "G3: fit 0.768 at 48px channels; 0.838 at 32px",
      "G3: opens on a legible window, the rest a pan away",
    ]);
    expect(
      metro.regions.map((region) => [region.prefix, region.columns]),
    ).toEqual([
      ["metro", 5],
      ["geo", 1],
      ["rdfs", 1],
    ]);
  });

  it("covers the canvas sparsely, with empty cells below it", () => {
    expect(measureAreaRatio(metro)).toBeCloseTo(0.0718, 4);
    expect(countEmptyCells(metro)).toBe(8);
  });

  it("opens on a legible window that cuts no box", () => {
    expect(metro.view).toMatchObject({ x: -16, y: -16, w: 616 });
    const right = metro.view.x + metro.view.w;
    const inView = [...metro.nodes.values()].filter((node) => node.x < right);
    expect(inView.filter((node) => node.x + node.w > right)).toEqual([]);
    expect(inView).toHaveLength(14);
  });

  it("overlaps nothing, crosses fewer edges than the label-sorted order, and keeps the rail's order", () => {
    expect(countOverlaps(metro)).toEqual({
      collisions: 0,
      edgesThroughBoxes: [],
      textOverlaps: 0,
    });
    expect(countCrossings(metro).total).toBe(2);
    expect(countCrossings(layOutClassGraph(metroGraph, 0)).total).toBe(7);
    expect(followsRailOrder(metro)).toBe(true);
  });

  it("routes a relation between its shelves through the gap between them", () => {
    const crossing = metro.edges.filter((edge) => edge.bundle?.cross === true);
    expect(crossing).toHaveLength(2);
    for (const edge of crossing) {
      expect(measurePathBounds(edge.d).x).toBeGreaterThanOrEqual(0);
    }
  });
});

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
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import layOutClassGraph from "../../lib/classGraph/layOutClassGraph.js";

const layout = layOutClassGraph(ontologyGraph);

describe("the class graph of the real ontology", () => {
  it("fits the design canvas at a zoom where every 14px label reads at 12px", () => {
    const fit = measureFit(layout);
    expect(fit.zoom).toBeGreaterThanOrEqual(12 / 14);
    expect(fit.zoom).toBeCloseTo(0.8599, 4);
    expect(fit.binding).toBe("height");
    expect(fit.otherFill).toBeGreaterThanOrEqual(0.6);
    expect(layout.viewBox).toEqual({ x: -16, y: -16, w: 864, h: 928 });
    expect(layout.findings).toEqual([]);
  });

  it("covers the canvas densely, with no holes", () => {
    const area = measureAreaRatio(layout);
    expect(area).toBeGreaterThanOrEqual(0.12);
    expect(area).toBeLessThanOrEqual(0.3);
    expect(area).toBeCloseTo(0.1429, 4);
    expect(countEmptyCells(layout)).toBe(2);
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
    expect(baseline.total).toBe(40);
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
      maxX: 320,
      inRailOrder: true,
      collisions: 0,
      arcsThroughRows: 0,
      maxSpinePorts: 2,
    });
  });
});

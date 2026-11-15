import {
  createGraphBudget,
  GRAPH_BUDGET,
  type GraphBudget,
} from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import {
  FOUR_NAMESPACE_GRAPH,
  SIXTY_CLASS_GRAPH,
} from "../../../testing/fixtures.js";
import metroGraph from "../../../testing/records/metroGraph.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import buildClassGraphModel from "./buildClassGraphModel.js";
import chooseDrawnScope from "./chooseDrawnScope.js";
import type { ClassGraphInput, DrawnScope } from "./types.js";

/** The scope of a graph at rest within a budget, and how many nodes it draws. */
function scopeOf(input: ClassGraphInput, budget: GraphBudget = GRAPH_BUDGET) {
  const model = buildClassGraphModel(input);
  const scope: DrawnScope = chooseDrawnScope(model, budget);
  const classes = model.regionOrder
    .filter(({ prefix }) => scope.expanded.includes(prefix))
    .reduce((sum, { ids }) => sum + ids.length, 0);
  return {
    scope,
    classes,
    drawn: classes + scope.collapsed.length + scope.stubs.length,
  };
}

describe("chooseDrawnScope", () => {
  it("collapses the docs site's largest namespace within the drawn nodes, and keeps every stub", () => {
    const { scope, classes, drawn } = scopeOf(FOUR_NAMESPACE_GRAPH);
    expect(scope).toEqual({
      expanded: ["ds", "anatomy", "cs"],
      collapsed: ["surface"],
      stubs: [
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#List",
        "https://dt.canonical.com/TokenSymbol",
        "https://example.org/vocab/Shelf",
      ],
    });
    expect(classes).toBe(35);
    expect(drawn).toBe(39);
    expect(drawn).toBeLessThanOrEqual(GRAPH_BUDGET.drawnNodesMax);
  });

  it("draws the three captured namespaces whole, with their two stubs", () => {
    expect(scopeOf(ontologyGraph)).toMatchObject({
      scope: { expanded: ["ds", "anatomy", "cs"], collapsed: [] },
      classes: 35,
      drawn: 37,
    });
  });

  it("draws the metro whole: 16 classes and no stub", () => {
    expect(scopeOf(metroGraph)).toEqual({
      scope: { expanded: ["metro", "geo", "rdfs"], collapsed: [], stubs: [] },
      classes: 16,
      drawn: 16,
    });
  });

  it("collapses a namespace too large for the budget alone", () => {
    expect(scopeOf(SIXTY_CLASS_GRAPH)).toEqual({
      scope: { expanded: [], collapsed: ["big"], stubs: [] },
      classes: 0,
      drawn: 1,
    });
  });

  it("collapses the largest first until the rest fit, keeping the stubs the boxes reach", () => {
    // 35 classes and 2 stubs, within 16: ds (20) collapses, leaving 18;
    // then anatomy (12). Their relations to the stubs leave from their
    // boxes, so both stubs stay.
    const { scope, drawn } = scopeOf(
      ontologyGraph,
      createGraphBudget({ drawnNodesMax: 16 }),
    );
    expect(scope).toEqual({
      expanded: ["cs"],
      collapsed: ["ds", "anatomy"],
      stubs: [
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#List",
        "https://dt.canonical.com/TokenSymbol",
      ],
    });
    expect(drawn).toBe(7);
  });

  it("drills into a namespace: it drawn class by class, every other one a box", () => {
    const model = buildClassGraphModel(FOUR_NAMESPACE_GRAPH);
    expect(chooseDrawnScope(model, GRAPH_BUDGET, "surface")).toMatchObject({
      expanded: ["surface"],
      collapsed: ["ds", "anatomy", "cs"],
    });
    expect(
      chooseDrawnScope(buildClassGraphModel(ontologyGraph), GRAPH_BUDGET, "ds"),
    ).toMatchObject({ expanded: ["ds"], collapsed: ["anatomy", "cs"] });
  });
});

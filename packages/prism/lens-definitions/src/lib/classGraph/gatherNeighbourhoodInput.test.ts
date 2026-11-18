import { createGraphBudget, GRAPH_BUDGET } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import { FOUR_NAMESPACE_GRAPH } from "../../../testing/fixtures.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import buildClassGraphModel from "./buildClassGraphModel.js";
import gatherNeighbourhoodInput from "./gatherNeighbourhoodInput.js";
import layOutClassGraph from "./layOutClassGraph.js";

const UI_BLOCK = "https://ds.canonical.com/UIBlock";

describe("gatherNeighbourhoodInput", () => {
  it("gathers a class, its superclass, its subclasses and the classes one relation away", () => {
    const { input, scope, findings } = gatherNeighbourhoodInput(
      ontologyGraph,
      buildClassGraphModel(ontologyGraph),
      UI_BLOCK,
      GRAPH_BUDGET,
    );
    const uris = new Set(input.classes.map((klass) => klass.uri));
    expect(uris.has(UI_BLOCK)).toBe(true);
    expect(uris.has("https://ds.canonical.com/UIElement")).toBe(true);
    for (const klass of ontologyGraph.classes) {
      if (klass.superclass === UI_BLOCK) expect(uris.has(klass.uri)).toBe(true);
    }
    for (const relation of ontologyGraph.relations) {
      if (relation.domain === UI_BLOCK && relation.range !== null) {
        expect(uris.has(relation.range)).toBe(true);
      }
    }
    expect(input.classes.length).toBe(14);
    expect(
      input.relations.every(
        (relation) =>
          relation.domain === UI_BLOCK || relation.range === UI_BLOCK,
      ),
    ).toBe(true);
    expect(scope).toEqual({ expanded: ["ds"], collapsed: [], stubs: [] });
    expect(findings).toEqual([]);
  });

  it("reaches across namespaces, with a stub for a range outside the graph", () => {
    const model = buildClassGraphModel(FOUR_NAMESPACE_GRAPH);
    const into = gatherNeighbourhoodInput(
      FOUR_NAMESPACE_GRAPH,
      model,
      UI_BLOCK,
      GRAPH_BUDGET,
    );
    expect(into.input.classes.map((klass) => klass.uri)).toContain(
      "surface:C0",
    );
    expect(into.scope.expanded).toContain("surface");
    const out = gatherNeighbourhoodInput(
      FOUR_NAMESPACE_GRAPH,
      model,
      "surface:C1",
      GRAPH_BUDGET,
    );
    expect(out.scope.stubs).toEqual(["https://example.org/vocab/Shelf"]);
  });

  it("keeps the most joined neighbours within the budget and names the rest", () => {
    const budget = createGraphBudget({ drawnNodesMax: 4 });
    const { input, findings } = gatherNeighbourhoodInput(
      ontologyGraph,
      buildClassGraphModel(ontologyGraph),
      UI_BLOCK,
      budget,
    );
    expect(input.classes).toHaveLength(4);
    expect(findings).toHaveLength(10);
    expect(findings.at(0)).toMatch(/^The neighbourhood leaves out https:/);
  });
});

describe("layOutClassGraph with a focus", () => {
  it("lays a class's neighbourhood within the budget, the same on every build", () => {
    const layout = layOutClassGraph(FOUR_NAMESPACE_GRAPH, {
      budget: GRAPH_BUDGET,
      focus: UI_BLOCK,
    });
    expect(layout.focus).toBe(UI_BLOCK);
    expect(layout.drilled).toBeUndefined();
    expect(layout.nodes.has(UI_BLOCK)).toBe(true);
    expect(layout.nodes.has("surface:C0")).toBe(true);
    expect(layout.nodes.size).toBeLessThanOrEqual(GRAPH_BUDGET.drawnNodesMax);
    expect(layout.regions.every((region) => !region.collapsed)).toBe(true);
    expect(layout.rail).toContain(UI_BLOCK);
    expect(
      layOutClassGraph(FOUR_NAMESPACE_GRAPH, {
        budget: GRAPH_BUDGET,
        focus: UI_BLOCK,
      }),
    ).toEqual(layout);
  });

  it("draws the overview when the focus names no class", () => {
    const rest = layOutClassGraph(FOUR_NAMESPACE_GRAPH, {
      budget: GRAPH_BUDGET,
    });
    const focused = layOutClassGraph(FOUR_NAMESPACE_GRAPH, {
      budget: GRAPH_BUDGET,
      focus: "https://example.org/Nothing",
    });
    expect(focused).toEqual(rest);
    expect(focused.focus).toBeUndefined();
  });
});

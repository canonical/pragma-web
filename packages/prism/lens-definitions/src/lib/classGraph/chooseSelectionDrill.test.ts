import { createGraphBudget, GRAPH_BUDGET } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import { FOUR_NAMESPACE_GRAPH } from "../../../testing/fixtures.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import chooseSelectionDrill from "./chooseSelectionDrill.js";
import layOutClassGraph from "./layOutClassGraph.js";

const UIBLOCK = "https://ds.canonical.com/UIBlock";

describe("chooseSelectionDrill", () => {
  it("drills into the namespace a box holds the selected class in", () => {
    const rest = layOutClassGraph(ontologyGraph, {
      budget: createGraphBudget({ drawnNodesMax: 20 }),
    });
    expect(rest.nodes.has(UIBLOCK)).toBe(false);
    expect(chooseSelectionDrill(ontologyGraph, rest, UIBLOCK)).toBe("ds");
    const drilled = layOutClassGraph(ontologyGraph, {
      budget: createGraphBudget({ drawnNodesMax: 20 }),
      drill: "ds",
    });
    expect(drilled.nodes.get(UIBLOCK)?.kind).toBe("class");
    expect(
      drilled.regions.filter((region) => region.collapsed).map((r) => r.prefix),
    ).toEqual(expect.arrayContaining(["anatomy", "cs"]));
  });

  it("drills into the docs site's generated fourth namespace at one of its classes", () => {
    const rest = layOutClassGraph(FOUR_NAMESPACE_GRAPH, {
      budget: GRAPH_BUDGET,
    });
    const [surfaceClass] = FOUR_NAMESPACE_GRAPH.classes.filter(
      (klass) => klass.prefix === "surface",
    );
    const uri = surfaceClass?.uri;
    expect(chooseSelectionDrill(FOUR_NAMESPACE_GRAPH, rest, uri)).toBe(
      "surface",
    );
    const drilled = layOutClassGraph(FOUR_NAMESPACE_GRAPH, {
      budget: GRAPH_BUDGET,
      drill: "surface",
    });
    const kinds = [...drilled.nodes.values()].map((node) => node.kind);
    expect(kinds.filter((kind) => kind === "class")).toHaveLength(31);
    expect(kinds.filter((kind) => kind === "region")).toHaveLength(3);
    expect(drilled.nodes.has(uri ?? "")).toBe(true);
    expect(drilled.nodes.size).toBeLessThanOrEqual(GRAPH_BUDGET.drawnNodesMax);
  });

  it("drills into nothing for a drawn class, a stranger or no selection", () => {
    const rest = layOutClassGraph(ontologyGraph, { budget: GRAPH_BUDGET });
    expect(chooseSelectionDrill(ontologyGraph, rest, UIBLOCK)).toBeUndefined();
    expect(
      chooseSelectionDrill(ontologyGraph, rest, "https://x.example/Y"),
    ).toBeUndefined();
    expect(
      chooseSelectionDrill(ontologyGraph, rest, undefined),
    ).toBeUndefined();
  });
});

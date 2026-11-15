import { GRAPH_BUDGET } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import createAllNamespacesFilter from "../../../../testing/createAllNamespacesFilter.js";
import createClassGraphSetup from "../../../../testing/createClassGraphSetup.js";
import ontologyGraph from "../../../../testing/records/ontologyGraph.js";
import layOutClassGraph from "../../classGraph/layOutClassGraph.js";
import classifyClasses from "./classifyClasses.js";

const { layout, terms, uris } = createClassGraphSetup();
const ALL = createAllNamespacesFilter(["ds", "cs", "anatomy"]);

describe("classifyClasses", () => {
  it("hides and dims nothing under the default filter", () => {
    const { hidden, dimmed } = classifyClasses(layout, terms, ALL);
    expect(hidden.size).toBe(0);
    expect(dimmed.size).toBe(0);
  });

  it("hides what a chip leaves out and dims what the search leaves out", () => {
    const { hidden, dimmed } = classifyClasses(layout, terms, {
      ...createAllNamespacesFilter(["ds", "cs"]),
      text: "tag",
    });
    expect(hidden.size).toBe(12);
    expect(hidden.has(uris.get("anatomy:Node") ?? "")).toBe(true);
    expect(dimmed.has(uris.get("ds:Tag") ?? "")).toBe(false);
    expect(dimmed.has(uris.get("ds:TagCategory") ?? "")).toBe(false);
    expect(dimmed.has(uris.get("ds:Component") ?? "")).toBe(true);
  });

  it("dims the classes without instances while the instances axis is on", () => {
    const { dimmed } = classifyClasses(layout, terms, {
      ...ALL,
      withInstances: true,
    });
    const empty = [...layout.nodes.values()].filter(
      (node) => node.instanceCount === 0,
    );
    expect(dimmed.size).toBe(empty.length);
  });

  describe("over boxes and stubs", () => {
    // At rest ds is one box and two stubs lie outside every namespace.
    const boxed = layOutClassGraph(ontologyGraph, { budget: GRAPH_BUDGET });
    const stubs = [...boxed.nodes.values()]
      .filter((node) => node.kind === "stub")
      .map((node) => node.uri);

    it("never hides a stub, even with every namespace chip off", () => {
      expect(stubs).toHaveLength(2);
      const { hidden } = classifyClasses(
        boxed,
        terms,
        createAllNamespacesFilter([]),
      );
      for (const stub of stubs) expect(hidden.has(stub)).toBe(false);
      expect(hidden.has("region:ds")).toBe(true);
    });

    it("hides a collapsed region by its namespace's chip alone", () => {
      const off = classifyClasses(
        boxed,
        terms,
        createAllNamespacesFilter(["cs"]),
      );
      expect(off.hidden.has("region:ds")).toBe(true);
      const on = classifyClasses(boxed, terms, {
        ...createAllNamespacesFilter(["ds"]),
        // A class would follow the abstraction chips too; a box does not.
        abstractions: ["abstract"],
      });
      expect(on.hidden.has("region:ds")).toBe(false);
    });
  });
});

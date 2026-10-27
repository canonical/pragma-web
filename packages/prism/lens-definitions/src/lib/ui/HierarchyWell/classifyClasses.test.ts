import { describe, expect, it } from "vitest";
import createAllNamespacesFilter from "../../../../testing/createAllNamespacesFilter.js";
import createClassGraphSetup from "../../../../testing/createClassGraphSetup.js";
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
});

import { GRAPH_BUDGET, measureRegionLabelWidth } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import { FOUR_NAMESPACE_GRAPH } from "../../../testing/fixtures.js";
import layOutClassGraph from "./layOutClassGraph.js";
import measureRegionHeading from "./measureRegionHeading.js";

describe("measureRegionHeading", () => {
  it("measures the label alone, and the opened namespace's with the words of its way back", () => {
    expect(measureRegionHeading("anatomy", 5, false)).toBe(
      measureRegionLabelWidth("anatomy", 5),
    );
    expect(measureRegionHeading("anatomy", 5, true)).toBeGreaterThan(
      measureRegionLabelWidth("anatomy", 5) + 80,
    );
  });

  it("widens each opened namespace's region to hold its heading", () => {
    for (const drill of ["anatomy", "cs", "ds", "surface"]) {
      const layout = layOutClassGraph(FOUR_NAMESPACE_GRAPH, {
        budget: GRAPH_BUDGET,
        drill,
      });
      const region = layout.regions.find(({ prefix }) => prefix === drill);
      expect(region?.w, drill).toBeGreaterThanOrEqual(
        measureRegionHeading(drill, region?.ids.length ?? 0, true),
      );
    }
  });
});

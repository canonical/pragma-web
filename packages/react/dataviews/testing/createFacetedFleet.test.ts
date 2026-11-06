import { describe, expect, it, onTestFinished } from "vitest";
import createFacetedFleet from "./createFacetedFleet.js";

describe("createFacetedFleet", () => {
  it("answers a fleet of twelve, with the status and cores facets", () => {
    const provider = createFacetedFleet();
    onTestFinished(provider.observe());
    const { result } = provider.state.get();
    expect(result.rows).toHaveLength(12);
    expect(Object.keys(result.facets ?? {}).sort()).toEqual([
      "cores",
      "status",
    ]);
  });

  it("stands on the location and the query it is given", () => {
    const located = createFacetedFleet({
      count: 3,
      href: "/machines?status=failed",
      facets: ["status"],
    });
    expect(located.state.get().slice.filter).toEqual([
      { field: "status", operator: "isAny", operands: ["failed"] },
    ]);
    const started = createFacetedFleet({ query: "status=running" });
    expect(started.state.get().slice.filter).toEqual([
      { field: "status", operator: "isAny", operands: ["running"] },
    ]);
  });
});

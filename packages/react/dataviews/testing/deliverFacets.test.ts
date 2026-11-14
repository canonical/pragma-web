import { describe, expect, it, onTestFinished } from "vitest";
import buildMachine from "./buildMachine.js";
import createFacetedManual from "./createFacetedManual.js";
import deliverFacets from "./deliverFacets.js";

describe("deliverFacets", () => {
  it("answers the latest request with one machine and the given facets", () => {
    const { provider, source } = createFacetedManual();
    onTestFinished(provider.observe());
    const facets = {
      status: {
        kind: "values",
        values: [{ value: "failed", count: { kind: "exact", value: 3 } }],
      },
      cores: { kind: "range", min: 1, max: 8 },
    } as const;
    deliverFacets(source, facets);
    const { result } = provider.state.get();
    expect(result.rows).toEqual([buildMachine("m-1", "alpha")]);
    expect(result.facets).toEqual(facets);
  });
});

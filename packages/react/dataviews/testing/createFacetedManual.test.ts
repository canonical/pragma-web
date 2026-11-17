import { describe, expect, it, onTestFinished } from "vitest";
import createFacetedManual from "./createFacetedManual.js";

describe("createFacetedManual", () => {
  it("asks for the status and cores facets, and leaves the answer to the test", () => {
    const { provider, source } = createFacetedManual();
    onTestFinished(provider.observe());
    expect(source.latest().request.facets).toEqual(["status", "cores"]);
    expect(provider.state.get().result.rows).toBeNull();
  });
});

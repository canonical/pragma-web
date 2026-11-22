import { describe, expect, it } from "vitest";
import selectFacetParams from "./selectFacetParams.js";

describe("selectFacetParams", () => {
  it("selects the parameters the view does not own", () => {
    expect(
      selectFacetParams({
        q: "bank",
        servesLine: "metro:circle-line",
        as: "table",
      }),
    ).toEqual(["servesLine"]);
  });

  it("leaves out empty and non-text values", () => {
    expect(selectFacetParams({ inZone: "", kind: 3 })).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import entitySearch from "./entitySearch.js";

describe("entitySearch", () => {
  it("keeps the view's parameters and the facet parameters", () => {
    expect(
      entitySearch["~standard"].validate({
        q: "bank",
        servesLine: "metro:circle-line",
        inZone: "",
      }),
    ).toEqual({ value: { q: "bank", servesLine: "metro:circle-line" } });
  });
});

import { describe, expect, it } from "vitest";
import { DEFAULT_LENS_FILTER } from "./constants.js";
import countAppliedFilters from "./countAppliedFilters.js";

describe("countAppliedFilters", () => {
  it("counts nothing for the default filter", () => {
    expect(countAppliedFilters(DEFAULT_LENS_FILTER)).toBe(0);
  });

  it("counts each namespace, the instances and the search text", () => {
    expect(
      countAppliedFilters({
        ...DEFAULT_LENS_FILTER,
        namespaces: ["ds", "cs"],
        withInstances: true,
        text: "chip",
      }),
    ).toBe(4);
  });
});

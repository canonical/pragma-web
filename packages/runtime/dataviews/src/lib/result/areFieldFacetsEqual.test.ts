import { describe, expect, it } from "vitest";
import countExactly from "../../../testing/countExactly.js";
import areFieldFacetsEqual from "./areFieldFacetsEqual.js";
import type { Facet } from "./types.js";

const range: Facet = { kind: "range", min: 1, max: 8 };
const values: Facet = {
  kind: "values",
  values: [{ value: "failed", count: countExactly(2) }],
};

describe("areFieldFacetsEqual", () => {
  it("compares two ranges by their ends", () => {
    expect(areFieldFacetsEqual(range, { ...range })).toBe(true);
    expect(areFieldFacetsEqual(range, { ...range, max: 9 })).toBe(false);
    expect(areFieldFacetsEqual(range, { ...range, min: 0 })).toBe(false);
  });

  it("holds a range apart from a list of values, either way round", () => {
    expect(areFieldFacetsEqual(range, values)).toBe(false);
    expect(areFieldFacetsEqual(values, range)).toBe(false);
  });

  it("compares two lists by their values and counts", () => {
    expect(
      areFieldFacetsEqual(values, {
        kind: "values",
        values: [{ value: "failed", count: countExactly(2) }],
      }),
    ).toBe(true);
    expect(
      areFieldFacetsEqual(values, {
        kind: "values",
        values: [{ value: "failed", count: countExactly(3) }],
      }),
    ).toBe(false);
    expect(
      areFieldFacetsEqual(values, {
        kind: "values",
        values: [{ value: "running", count: countExactly(2) }],
      }),
    ).toBe(false);
  });
});

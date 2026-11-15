import type { Facet } from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import isSameFacet from "./isSameFacet.js";

const buildValuesFacet = (count: number): Facet => ({
  kind: "values",
  values: [{ value: "failed", count: { kind: "exact", value: count } }],
});

describe("isSameFacet", () => {
  it("holds two facets claiming the same values and counts equal", () => {
    expect(isSameFacet(buildValuesFacet(3), buildValuesFacet(3))).toBe(true);
    expect(isSameFacet(buildValuesFacet(3), buildValuesFacet(4))).toBe(false);
  });

  it("holds two ranges equal by their ends", () => {
    const buildRangeFacet = (max: number): Facet => ({
      kind: "range",
      min: 1,
      max,
    });
    expect(isSameFacet(buildRangeFacet(8), buildRangeFacet(8))).toBe(true);
    expect(isSameFacet(buildRangeFacet(8), buildRangeFacet(9))).toBe(false);
  });

  it("holds facets of different kinds apart", () => {
    expect(
      isSameFacet(buildValuesFacet(1), { kind: "range", min: 1, max: 1 }),
    ).toBe(false);
  });

  it("holds an unanswered facet and a missing one apart, and each equal to itself", () => {
    expect(isSameFacet(null, null)).toBe(true);
    expect(isSameFacet(undefined, undefined)).toBe(true);
    expect(isSameFacet(null, undefined)).toBe(false);
    expect(isSameFacet(null, buildValuesFacet(1))).toBe(false);
    expect(isSameFacet(buildValuesFacet(1), undefined)).toBe(false);
  });
});

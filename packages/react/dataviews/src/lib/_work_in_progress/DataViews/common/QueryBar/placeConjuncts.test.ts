import {
  EMPTY_SLICE,
  type Predicate,
  type Slice,
} from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import placeConjuncts from "./placeConjuncts.js";

const sliceOf = (...filter: Predicate[]): Slice => ({ ...EMPTY_SLICE, filter });

const cores = (bound: number): Predicate => ({
  field: "cores",
  operator: "gte",
  operands: [bound],
});

describe("placeConjuncts", () => {
  it("places nothing in an empty filter", () => {
    expect(placeConjuncts(sliceOf())).toEqual([]);
  });

  it("numbers each conjunct among those at its address, in canonical order", () => {
    // Canonical order reads the bounds by their text: 16, then 4.
    expect(
      placeConjuncts(
        sliceOf(
          cores(4),
          { field: "cores", operator: "lte", operands: [8] },
          cores(16),
        ),
      ),
    ).toEqual([
      {
        predicate: cores(16),
        ref: { field: "cores", operator: "gte", nth: 0 },
      },
      { predicate: cores(4), ref: { field: "cores", operator: "gte", nth: 1 } },
      {
        predicate: { field: "cores", operator: "lte", operands: [8] },
        ref: { field: "cores", operator: "lte", nth: 0 },
      },
    ]);
  });

  it("places a conjunct spelled twice once, its set in canonical order", () => {
    expect(
      placeConjuncts(
        sliceOf(
          { field: "tags", operator: "isAny", operands: ["b", "a"] },
          { field: "tags", operator: "isAny", operands: ["a", "b"] },
        ),
      ),
    ).toEqual([
      {
        predicate: { field: "tags", operator: "isAny", operands: ["a", "b"] },
        ref: { field: "tags", operator: "isAny", nth: 0 },
      },
    ]);
  });
});

import { describe, expect, it } from "vitest";
import type { Predicate } from "../query/index.js";
import isSamePredicate from "./isSamePredicate.js";

const failed: Predicate = {
  field: "status",
  operator: "isAny",
  operands: ["failed", "pending"],
};

describe("isSamePredicate", () => {
  it("holds two absent predicates the same", () => {
    expect(isSamePredicate(null, null)).toBe(true);
  });

  it("holds one predicate the same as itself", () => {
    expect(isSamePredicate(failed, failed)).toBe(true);
  });

  it("holds an absent predicate apart from a present one", () => {
    expect(isSamePredicate(failed, null)).toBe(false);
    expect(isSamePredicate(null, failed)).toBe(false);
  });

  it("compares two present predicates by what they ask", () => {
    expect(
      isSamePredicate(failed, { ...failed, operands: ["pending", "failed"] }),
    ).toBe(true);
    expect(isSamePredicate(failed, { ...failed, operands: ["failed"] })).toBe(
      false,
    );
  });
});

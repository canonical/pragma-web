import { describe, expect, it } from "vitest";
import compareConjuncts from "./compareConjuncts.js";
import type { Predicate, PredicateOperand } from "./types.js";

const tags = (...operands: PredicateOperand[]): Predicate => ({
  field: "tags",
  operator: "isAny",
  operands,
});

describe("compareConjuncts", () => {
  it("orders by field, then operator, as the address does", () => {
    expect(compareConjuncts(tags("b"), { ...tags("a"), field: "zone" })).toBe(
      -1,
    );
    expect(
      compareConjuncts(
        { ...tags("a"), field: "a.b" },
        { ...tags("a"), field: "a" },
      ),
    ).toBe(1);
    expect(
      compareConjuncts(tags("z"), { ...tags("a"), operator: "isNone" }),
    ).toBe(-1);
  });

  it("orders one address's conjuncts by operands from the left, shorter first", () => {
    expect(compareConjuncts(tags("ex-gpu"), tags("ex-nvme"))).toBeLessThan(0);
    expect(compareConjuncts(tags("ex-gpu", "ex-ssd"), tags("ex-gpu"))).toBe(1);
    expect(compareConjuncts(tags("ex-gpu"), tags("ex-gpu", "ex-ssd"))).toBe(-1);
  });

  it("orders operands of one type by their text and of two by their type", () => {
    expect(compareConjuncts(tags(10), tags(9))).toBeLessThan(0);
    expect(compareConjuncts(tags(true), tags(false))).toBeGreaterThan(0);
    // boolean < number < object < string, as operand ranks order them.
    expect(compareConjuncts(tags(1), tags("1"))).toBeLessThan(0);
    expect(compareConjuncts(tags(null), tags(true))).toBeGreaterThan(0);
  });

  it("is zero only for conjuncts the query cannot tell apart", () => {
    expect(compareConjuncts(tags("a", 1), tags("a", 1))).toBe(0);
    expect(compareConjuncts(tags(-0), tags(0))).toBe(0);
    expect(compareConjuncts(tags(1), tags("1"))).not.toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import recordConjunct from "./recordConjunct.js";
import type { ReadPredicate } from "./types.js";

const set = (operands: string[]) => ({
  predicate: { field: "status", operator: "isAny" as const, operands },
  ordinal: 0,
  taken: [0],
});

const bound = (operands: number[]) => ({
  predicate: { field: "cpu", operator: "gte" as const, operands },
  ordinal: 1,
  taken: [0],
});

describe("recordConjunct", () => {
  it("adds a new conjunct, and merges a set's second spelling", () => {
    const none: readonly ReadPredicate[] = [];
    const added = recordConjunct(none, "status", set(["failed"]));
    expect(added.record).toBe("added");
    expect(none).toEqual([]);
    const merged = recordConjunct(
      added.filter,
      "status__isAny",
      set(["ready"]),
    );
    expect(merged).toEqual({
      filter: [
        {
          predicate: {
            field: "status",
            operator: "isAny",
            operands: ["failed", "ready"],
          },
          ordinal: 0,
          keys: ["status", "status__isAny"],
        },
      ],
      issue: null,
      record: "merged",
    });
  });

  it("ignores a repeat of a one-value conjunct, and reports it", () => {
    const { filter } = recordConjunct(
      recordConjunct([], "status", set(["failed"])).filter,
      "cpu__gte__1",
      bound([4]),
    );
    const repeated = recordConjunct(filter, "cpu__gte__01", bound([8]));
    expect(repeated.record).toBe("repeated");
    expect(repeated.filter).toBe(filter);
    expect(repeated.issue?.parameter).toBe("cpu__gte__01");
  });
});

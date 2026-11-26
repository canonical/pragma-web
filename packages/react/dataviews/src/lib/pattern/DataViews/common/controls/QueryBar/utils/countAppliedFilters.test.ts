import { describe, expect, it } from "vitest";
import type { QueryClause } from "../types.js";
import countAppliedFilters from "./countAppliedFilters.js";

describe("countAppliedFilters", () => {
  it("counts each conjunct and a range once, never the search or a refusal", () => {
    const clauses = [
      { kind: "predicate", id: "status__isAny__0" },
      { kind: "range", id: "cores__range" },
      { kind: "search", id: "search" },
      { kind: "refused", id: "refused__status" },
    ] as unknown as readonly QueryClause[];
    expect(countAppliedFilters(clauses)).toBe(2);
    expect(countAppliedFilters([])).toBe(0);
  });
});

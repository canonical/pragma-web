import { describe, expect, it } from "vitest";
import type { QueryIssue } from "../result/index.js";
import isClauseReplaced from "./isClauseReplaced.js";

const status: QueryIssue = {
  parameter: "status",
  field: "status",
  code: "invalid",
  reason: '"melted" is not an option',
};

const search: QueryIssue = {
  parameter: "q",
  field: null,
  code: "undeclared-field",
  reason: "this source cannot search",
};

describe("isClauseReplaced", () => {
  it("replaces a filter's clause by any predicate on its field", () => {
    expect(
      isClauseReplaced(
        {
          kind: "setPredicate",
          predicate: { field: "status", operator: "isNone", operands: ["a"] },
        },
        status,
      ),
    ).toBe(true);
    expect(
      isClauseReplaced(
        { kind: "removePredicate", field: "status", operator: "isAny" },
        status,
      ),
    ).toBe(true);
    expect(
      isClauseReplaced(
        { kind: "removePredicate", field: "cpu", operator: "gte" },
        status,
      ),
    ).toBe(false);
  });

  it("replaces a filter's clause by a conjunct added on its field", () => {
    expect(
      isClauseReplaced(
        {
          kind: "addPredicate",
          predicate: { field: "status", operator: "isAny", operands: ["a"] },
        },
        status,
      ),
    ).toBe(true);
    expect(
      isClauseReplaced(
        {
          kind: "addPredicate",
          predicate: { field: "cpu", operator: "gte", operands: [4] },
        },
        status,
      ),
    ).toBe(false);
  });

  it("replaces a filter's clause by an edit touching its field", () => {
    expect(
      isClauseReplaced(
        {
          kind: "editPredicates",
          remove: [{ field: "status", operator: "isAny", nth: 0 }],
          add: [],
        },
        status,
      ),
    ).toBe(true);
    expect(
      isClauseReplaced(
        {
          kind: "editPredicates",
          remove: [],
          add: [{ field: "status", operator: "isNone", operands: ["a"] }],
        },
        status,
      ),
    ).toBe(true);
    expect(
      isClauseReplaced(
        {
          kind: "editPredicates",
          remove: [{ field: "cpu", operator: "gte", nth: 0 }],
          add: [{ field: "cpu", operator: "lte", operands: [8] }],
        },
        status,
      ),
    ).toBe(false);
  });

  it("replaces a refused search by the search, and nothing else by it", () => {
    expect(isClauseReplaced({ kind: "setSearch", search: "" }, search)).toBe(
      true,
    );
    expect(isClauseReplaced({ kind: "setSearch", search: "" }, status)).toBe(
      false,
    );
  });

  it("replaces nothing by a command addressing no clause", () => {
    expect(isClauseReplaced({ kind: "setSort", sort: [] }, status)).toBe(false);
    expect(isClauseReplaced({ kind: "navigateWindow", page: 2 }, search)).toBe(
      false,
    );
  });

  it("replaces a clause by a clear emptying the part it is in", () => {
    expect(isClauseReplaced({ kind: "clear", paths: ["filter"] }, status)).toBe(
      true,
    );
    expect(isClauseReplaced({ kind: "clear", paths: ["filter"] }, search)).toBe(
      false,
    );
    expect(isClauseReplaced({ kind: "clear", paths: ["search"] }, search)).toBe(
      true,
    );
    expect(isClauseReplaced({ kind: "clear", paths: ["search"] }, status)).toBe(
      false,
    );
  });
});

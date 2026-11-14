import { describe, expect, it } from "vitest";
import type { Slice } from "../query/index.js";
import type { QueryIssue } from "../result/index.js";
import listCarriedIssues from "./listCarriedIssues.js";

const emptySlice: Slice = { filter: [], search: null, sort: [], group: [] };

const failedOnly: Slice = {
  ...emptySlice,
  filter: [{ field: "status", operator: "isAny", operands: ["failed"] }],
};

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

describe("listCarriedIssues", () => {
  it("carries a refused filter into a destination that leaves its field as it is", () => {
    const sorted: Slice = {
      ...failedOnly,
      sort: [{ field: "name", direction: "asc" }],
    };
    expect(listCarriedIssues([status], failedOnly, sorted)).toEqual([status]);
  });

  it("carries none into a destination that changes the field's predicates", () => {
    const moved: Slice = {
      ...emptySlice,
      filter: [{ field: "status", operator: "isNone", operands: ["failed"] }],
    };
    expect(listCarriedIssues([status], failedOnly, moved)).toEqual([]);
    expect(listCarriedIssues([status], failedOnly, emptySlice)).toEqual([]);
    const widened: Slice = {
      ...emptySlice,
      filter: [
        { field: "status", operator: "isAny", operands: ["failed", "ready"] },
      ],
    };
    expect(listCarriedIssues([status], failedOnly, widened)).toEqual([]);
  });

  it("carries a refused search only while the search stays", () => {
    expect(listCarriedIssues([search], emptySlice, failedOnly)).toEqual([
      search,
    ]);
    expect(
      listCarriedIssues([search], emptySlice, { ...emptySlice, search: "web" }),
    ).toEqual([]);
  });
});

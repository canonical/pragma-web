import { describe, expect, it } from "vitest";
import { declareSort } from "../../../testing/index.js";
import listSortRefusals from "./listSortRefusals.js";

const byCpu = { field: "cpu", direction: "asc" } as const;
const byName = { field: "name", direction: "desc" } as const;

describe("listSortRefusals", () => {
  it("refuses nothing within an unbounded declaration", () => {
    expect(listSortRefusals(declareSort(["cpu"]), [byCpu])).toEqual([]);
  });

  it("says once that a source declaring no terms cannot sort", () => {
    expect(listSortRefusals(declareSort(["cpu"], 0), [byCpu, byName])).toEqual([
      {
        part: "sort",
        code: "too-many-terms",
        field: null,
        operator: null,
        reason: "this source cannot sort",
      },
    ]);
  });

  it("reports an undeclared field beside the term limit", () => {
    expect(
      listSortRefusals(declareSort(["cpu"], 1), [byCpu, byName]).map(
        ({ field, reason }) => [field, reason],
      ),
    ).toEqual([
      [null, "this source orders by at most 1 term"],
      ["name", 'field "name" cannot be sorted'],
    ]);
  });
});

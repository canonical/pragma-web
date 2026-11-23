import { describe, expect, it } from "vitest";
import {
  FACETED_ROWS,
  FACETED_SCHEMA,
  readId,
} from "../../../testing/index.js";
import { EMPTY_SLICE, type Predicate, type Slice } from "../query/index.js";
import { createSchema } from "../schema/index.js";
import selectRows from "./selectRows.js";

/** The ids of the fixture rows a filter and search select, searching `name` and `cpu`. */
const selectIds = (
  filter: readonly Predicate[],
  search: string | null = null,
  lifted: string | null = null,
): readonly string[] => {
  const slice: Slice = { ...EMPTY_SLICE, filter, search };
  return selectRows(
    FACETED_ROWS,
    slice,
    { schema: FACETED_SCHEMA, searchFields: ["name", "cpu"] },
    lifted,
  ).map(readId);
};

describe("selectRows", () => {
  it("selects every row, in order, for a slice restricting nothing", () => {
    expect(selectIds([])).toEqual(["a", "b", "c", "d", "e", "g", "f"]);
  });

  it("selects the rows holding a value for isSet", () => {
    expect(
      selectIds([{ field: "owner", operator: "isSet", operands: [] }]),
    ).toEqual(["a", "d"]);
  });

  it("selects only choice values for isAny and isNone", () => {
    expect(
      selectIds([{ field: "status", operator: "isAny", operands: ["failed"] }]),
    ).toEqual(["b", "c"]);
    expect(
      selectIds([
        { field: "status", operator: "isNone", operands: ["failed"] },
      ]),
    ).toEqual(["a", "d", "g"]);
  });

  it("compares a value by its text against the server's options", () => {
    const schema = createSchema([{ field: "code", kind: "choices" }]);
    const rows = [
      { id: "a", code: 1 },
      { id: "b", code: "2" },
    ];
    const slice: Slice = {
      ...EMPTY_SLICE,
      filter: [{ field: "code", operator: "isAny", operands: ["1", "2"] }],
    };
    expect(selectRows(rows, slice, { schema }, null).map(readId)).toEqual([
      "a",
      "b",
    ]);
  });

  it("selects a range through the field's kind", () => {
    expect(
      selectIds([{ field: "cpu", operator: "gte", operands: [16] }]),
    ).toEqual(["b", "d"]);
    expect(
      selectIds([{ field: "cpu", operator: "lte", operands: [8] }]),
    ).toEqual(["a", "c"]);
  });

  it("selects nothing for a range with no bound, no field, or no order", () => {
    expect(
      selectIds([{ field: "cpu", operator: "gte", operands: [] }]),
    ).toEqual([]);
    expect(
      selectIds([{ field: "ram", operator: "gte", operands: [1] }]),
    ).toEqual([]);
    expect(
      selectIds([{ field: "owner", operator: "gte", operands: ["ex:a"] }]),
    ).toEqual([]);
  });

  it("selects text holding or starting with the folded operand", () => {
    expect(
      selectIds([{ field: "name", operator: "contains", operands: ["TA"] }]),
    ).toEqual(["b", "d"]);
    expect(
      selectIds([{ field: "name", operator: "startsWith", operands: ["Ga"] }]),
    ).toEqual(["c"]);
  });

  it("selects nothing for text looked for with an operand that is not text", () => {
    expect(
      selectIds([{ field: "name", operator: "contains", operands: [4] }]),
    ).toEqual([]);
  });

  it("searches text and numbers in the declared fields, folded", () => {
    expect(selectIds([], "ALP")).toEqual(["a"]);
    expect(selectIds([], "32")).toEqual(["d"]);
    expect(selectIds([], "zeta")).toEqual([]);
  });

  it("searches nothing when no field is declared searchable", () => {
    const slice: Slice = { ...EMPTY_SLICE, search: "alpha" };
    expect(
      selectRows(FACETED_ROWS, slice, { schema: FACETED_SCHEMA }, null),
    ).toEqual([]);
  });

  it("leaves out the predicates over the lifted field", () => {
    const failed: Predicate = {
      field: "status",
      operator: "isAny",
      operands: ["failed"],
    };
    expect(selectIds([failed], null, "status")).toHaveLength(
      FACETED_ROWS.length,
    );
  });
});

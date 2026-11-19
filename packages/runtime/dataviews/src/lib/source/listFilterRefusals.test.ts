import { describe, expect, it } from "vitest";
import listFilterRefusals from "./listFilterRefusals.js";

describe("listFilterRefusals", () => {
  const declared = { status: ["isAny"], cpu: [] } as const;

  it("refuses nothing a field declares", () => {
    expect(
      listFilterRefusals(declared, [
        { field: "status", operator: "isAny", operands: ["ready"] },
      ]),
    ).toEqual([]);
  });

  it("refuses a field declared with no operator, or not at all", () => {
    expect(
      listFilterRefusals(declared, [
        { field: "cpu", operator: "gte", operands: [2] },
        { field: "toString", operator: "isSet", operands: [] },
      ]).map(({ code, field }) => [code, field]),
    ).toEqual([
      ["undeclared-field", "cpu"],
      ["undeclared-field", "toString"],
    ]);
  });

  it("refuses an address once, however many conjuncts it holds", () => {
    expect(
      listFilterRefusals(declared, [
        { field: "status", operator: "isNone", operands: ["failed"] },
        { field: "status", operator: "isNone", operands: ["ready"] },
        { field: "zone", operator: "isAny", operands: ["north"] },
        { field: "zone", operator: "isAny", operands: ["south"] },
      ]).map(({ code, field, operator }) => [code, field, operator]),
    ).toEqual([
      ["undeclared-operator", "status", "isNone"],
      ["undeclared-field", "zone", "isAny"],
    ]);
  });

  it("refuses an operator the field does not declare", () => {
    expect(
      listFilterRefusals(declared, [
        { field: "status", operator: "isNone", operands: ["ready"] },
      ]),
    ).toEqual([
      {
        part: "filter",
        code: "undeclared-operator",
        field: "status",
        operator: "isNone",
        reason: 'field "status" cannot be filtered with isNone',
      },
    ]);
  });
});

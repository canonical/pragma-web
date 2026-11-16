import { describe, expect, it } from "vitest";
import filterStatusBy from "./filterStatusBy.js";

describe("filterStatusBy", () => {
  it("filters the status to the operands and nothing else", () => {
    expect(filterStatusBy(["failed"]).filter).toEqual([
      { field: "status", operator: "isAny", operands: ["failed"] },
    ]);
  });
});

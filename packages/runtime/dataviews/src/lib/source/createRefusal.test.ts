import { describe, expect, it } from "vitest";
import createRefusal from "./createRefusal.js";

describe("createRefusal", () => {
  it("names no field or operator unless given", () => {
    expect(createRefusal("search", "undeclared-field", "no search")).toEqual({
      part: "search",
      code: "undeclared-field",
      field: null,
      operator: null,
      reason: "no search",
    });
  });

  it("carries the field and operator it is given", () => {
    expect(
      createRefusal("filter", "undeclared-operator", "no gte", "cpu", "gte"),
    ).toEqual({
      part: "filter",
      code: "undeclared-operator",
      field: "cpu",
      operator: "gte",
      reason: "no gte",
    });
  });
});

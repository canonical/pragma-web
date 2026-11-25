import { createSchema } from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import resolveTypedSymbol from "./resolveTypedSymbol.js";

const schema = createSchema([
  { field: "status", kind: "choices", options: ["failed"] },
  { field: "name", kind: "text" },
  { field: "cores", kind: "number" },
  { field: "owner", kind: "presence" },
]);

const resolveOn = (field: string, symbol: string) =>
  resolveTypedSymbol(symbol, schema.listOperators(field));

describe("resolveTypedSymbol", () => {
  it("reads : and != by the kind the field offers them for", () => {
    expect(resolveOn("status", ":")).toEqual({
      operator: "isAny",
      widened: false,
    });
    expect(resolveOn("status", "!=")).toEqual({
      operator: "isNone",
      widened: false,
    });
    expect(resolveOn("name", ":")).toEqual({ operator: "is", widened: false });
    expect(resolveOn("name", "!=")).toEqual({
      operator: "isNot",
      widened: false,
    });
  });

  it("reads the bounds, widening a strict one", () => {
    expect(resolveOn("cores", ">=")).toEqual({
      operator: "gte",
      widened: false,
    });
    expect(resolveOn("cores", ">")).toEqual({ operator: "gte", widened: true });
    expect(resolveOn("cores", "<=")).toEqual({
      operator: "lte",
      widened: false,
    });
    expect(resolveOn("cores", "<")).toEqual({ operator: "lte", widened: true });
  });

  it("reads nothing the field does not offer, or no symbol at all", () => {
    expect(resolveOn("cores", ":")).toBeNull();
    expect(resolveOn("status", ">")).toBeNull();
    expect(resolveOn("owner", ":")).toBeNull();
    expect(resolveOn("cores", "=>")).toBeNull();
    expect(resolveTypedSymbol(">", [])).toBeNull();
  });

  it("reads only the operators the source offers", () => {
    expect(resolveTypedSymbol(">", ["lte"])).toBeNull();
    expect(resolveTypedSymbol("<", ["lte"])).toEqual({
      operator: "lte",
      widened: true,
    });
  });
});

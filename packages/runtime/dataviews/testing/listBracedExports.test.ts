import { describe, expect, it } from "vitest";
import listBracedExports from "./listBracedExports.js";

describe("listBracedExports", () => {
  it("reads a type-only list as types", () => {
    expect(listBracedExports("{ A, B }", 0, true)).toEqual([
      { name: "A", kind: "type", isDefault: false, isAtEnd: false },
      { name: "B", kind: "type", isDefault: false, isAtEnd: false },
    ]);
  });

  it("reads an inline type and a re-export from another module", () => {
    expect(
      listBracedExports(
        '{ type A, B as default, , " " as C } from " "',
        0,
        false,
      ),
    ).toEqual([
      { name: "A", kind: "type", isDefault: false, isAtEnd: false },
      { name: "B", kind: "reexport", isDefault: true, isAtEnd: false },
    ]);
  });

  it("reads local bindings and whether each is at the end", () => {
    const masked = "const A = 1;\nconst B = f();\nexport { A, B as C };";
    expect(listBracedExports(masked, masked.indexOf("{ A"), false)).toEqual([
      { name: "A", kind: "value", isDefault: false, isAtEnd: true },
      { name: "C", kind: "value", isDefault: false, isAtEnd: false },
    ]);
  });
});

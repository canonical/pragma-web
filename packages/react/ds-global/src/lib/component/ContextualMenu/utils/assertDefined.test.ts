import { describe, expect, it } from "vitest";
import assertDefined from "./assertDefined.js";

describe("assertDefined", () => {
  it("returns a present value, falsy ones included", () => {
    expect(assertDefined(0, "a number")).toBe(0);
  });

  it.each([null, undefined])("throws on %s", (value) => {
    expect(() => assertDefined(value, "a popover")).toThrow(
      "ContextualMenu: a popover",
    );
  });
});

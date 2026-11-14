import { describe, expect, it } from "vitest";
import assertInvariant from "./assertInvariant.js";

describe("assertInvariant", () => {
  it("returns a value that is there, falsy ones included", () => {
    expect(assertInvariant(0, "a count")).toBe(0);
    expect(assertInvariant("", "a name")).toBe("");
  });

  it("throws on null and undefined", () => {
    expect(() => assertInvariant(null, "a row")).toThrow(
      "invariant broken: a row",
    );
    expect(() => assertInvariant([].at(0), "a first row")).toThrow(
      "invariant broken: a first row",
    );
  });
});

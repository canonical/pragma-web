import { describe, expect, it } from "vitest";
import { requireAt, requireDefined, requireEntry } from "./require.js";

describe("requireAt", () => {
  it("reads an element in range, from either end", () => {
    expect(requireAt(["a", "b"], 1)).toBe("b");
    expect(requireAt(["a", "b"], -1)).toBe("b");
  });

  it("fails on an index out of range", () => {
    expect(() => requireAt(["a"], 3)).toThrow(/no element at 3/);
  });
});

describe("requireEntry", () => {
  it("reads a present entry and fails on a missing one", () => {
    const map = new Map([["a", 1]]);
    expect(requireEntry(map, "a")).toBe(1);
    expect(() => requireEntry(map, "b")).toThrow(/no entry for b/);
  });
});

describe("requireDefined", () => {
  it("reads a set value and fails on a missing one, naming it", () => {
    expect(requireDefined(0, "zero")).toBe(0);
    expect(() => requireDefined(undefined, "bus of ex:Thing")).toThrow(
      /no bus of ex:Thing/,
    );
  });
});

import { describe, expect, it } from "vitest";
import compareByCodeUnit from "./compareByCodeUnit.js";

describe("compareByCodeUnit", () => {
  it("orders two strings by code unit", () => {
    expect(compareByCodeUnit("a", "b")).toBe(-1);
    expect(compareByCodeUnit("b", "a")).toBe(1);
  });

  it("orders capitals before lower case, whatever the locale", () => {
    expect(compareByCodeUnit("Z", "a")).toBe(-1);
  });

  it("ties equal strings", () => {
    expect(compareByCodeUnit("a", "a")).toBe(0);
  });
});

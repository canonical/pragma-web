import { describe, expect, it } from "vitest";
import isFacetField from "./isFacetField.js";

describe("isFacetField", () => {
  it("accepts the status and the cores", () => {
    expect(isFacetField("status")).toBe(true);
    expect(isFacetField("cores")).toBe(true);
  });

  it("refuses any other field or value", () => {
    expect(isFacetField("name")).toBe(false);
    expect(isFacetField("Status")).toBe(false);
    expect(isFacetField(null)).toBe(false);
    expect(isFacetField(["status"])).toBe(false);
  });
});

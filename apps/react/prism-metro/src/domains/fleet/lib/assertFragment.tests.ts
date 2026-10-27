import { describe, expect, it } from "vitest";
import assertFragment from "./assertFragment.js";

describe("assertFragment", () => {
  it("returns the key the spread holds", () => {
    const key = { id: "k" };
    expect(assertFragment(key, "readUnitCars_unit")).toBe(key);
  });

  it("throws, naming the fragment, when the spread holds none", () => {
    expect(() => assertFragment(null, "readUnitCars_unit")).toThrow(
      "the readUnitCars_unit spread holds no fragment key",
    );
    expect(() => assertFragment(undefined, "readUnitCars_unit")).toThrow(
      "the readUnitCars_unit spread holds no fragment key",
    );
  });
});

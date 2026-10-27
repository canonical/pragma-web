import { describe, expect, it } from "vitest";
import { COUNT_FORMAT, LENGTH_FORMAT } from "../constants.js";
import describeRange from "./describeRange.js";

describe("describeRange", () => {
  it("reads one value when every measure shares it", () => {
    expect(describeRange([60, 60], LENGTH_FORMAT)).toBe("60 m");
  });

  it("reads one value when the measures differ below the format's precision", () => {
    expect(describeRange([62, 62.04], LENGTH_FORMAT)).toBe("62 m");
  });

  it("reads the range from the least to the most, the unit once", () => {
    expect(describeRange([120, 60], LENGTH_FORMAT)).toBe("60–120 m");
  });

  it("reads a range of counts", () => {
    expect(describeRange([980, 490], COUNT_FORMAT)).toBe("490–980");
  });
});

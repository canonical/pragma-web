import { describe, expect, it } from "vitest";
import { sumMeasures } from "./sumMeasures.js";

describe("sumMeasures", () => {
  it("measures an empty list as zero", () => {
    expect(sumMeasures([])).toEqual({ length: 0, capacity: 0 });
  });

  it("sums the lengths and the capacities", () => {
    expect(
      sumMeasures([
        { length: 18400, capacity: 140 },
        { length: 17600, capacity: 150 },
      ]),
    ).toEqual({ length: 36000, capacity: 290 });
  });
});

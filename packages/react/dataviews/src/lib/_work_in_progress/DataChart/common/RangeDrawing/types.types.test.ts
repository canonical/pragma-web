import { describe, expectTypeOf, it } from "vitest";
import type { RangeDrawingProps } from "./types.js";

describe("RangeDrawingProps", () => {
  it("requires the label and both ends, and takes the declared bounds where there are any", () => {
    expectTypeOf<RangeDrawingProps>().toEqualTypeOf<{
      readonly label: string;
      readonly min: number;
      readonly max: number;
      readonly lowerBound: number | undefined;
      readonly upperBound: number | undefined;
    }>();
  });
});

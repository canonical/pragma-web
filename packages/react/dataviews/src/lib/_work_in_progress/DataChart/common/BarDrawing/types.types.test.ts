import type { Facet } from "@canonical/dataviews-core";
import { describe, expectTypeOf, it } from "vitest";
import type { BarDrawingProps, DrawnValue } from "./types.js";

describe("DrawnValue", () => {
  it("is one value of a values facet, with its count", () => {
    expectTypeOf<DrawnValue>().toEqualTypeOf<
      Extract<Facet, { readonly kind: "values" }>["values"][number]
    >();
    expectTypeOf<DrawnValue>().toHaveProperty("value");
    expectTypeOf<DrawnValue>().toHaveProperty("count");
  });
});

describe("BarDrawingProps", () => {
  it("requires the label and the values, and takes nothing else", () => {
    expectTypeOf<BarDrawingProps>().toEqualTypeOf<{
      readonly label: string;
      readonly values: readonly DrawnValue[];
    }>();
  });
});

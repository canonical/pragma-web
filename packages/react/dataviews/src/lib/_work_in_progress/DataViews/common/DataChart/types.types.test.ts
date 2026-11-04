import type { SchemaFieldDefinition } from "@canonical/dataviews-core";
import { describe, expectTypeOf, it } from "vitest";
import type {
  DataChartProps,
  DataChartType,
} from "../../../DataChart/index.js";
import type { DataViewsDataChartProps } from "./types.js";

describe("DataViewsDataChartProps", () => {
  it("takes the chart's own props over the widest records", () => {
    expectTypeOf<DataViewsDataChartProps>().toEqualTypeOf<
      Omit<
        DataChartProps<readonly SchemaFieldDefinition[]>,
        "provider" | "messages"
      >
    >();
    expectTypeOf<
      DataViewsDataChartProps["type"]
    >().toEqualTypeOf<DataChartType>();
  });

  it("takes no provider and no words, which come from the root", () => {
    expectTypeOf<DataViewsDataChartProps>().not.toHaveProperty("provider");
    expectTypeOf<DataViewsDataChartProps>().not.toHaveProperty("messages");
  });
});

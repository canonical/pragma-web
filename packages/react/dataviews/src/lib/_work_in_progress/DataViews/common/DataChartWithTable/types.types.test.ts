import type { SchemaFieldDefinition } from "@canonical/dataviews-core";
import { describe, expectTypeOf, it } from "vitest";
import type { DataChartWithTableProps } from "../../../DataChartWithTable/index.js";
import type { DataViewsDataChartWithTableProps } from "./types.js";

describe("DataViewsDataChartWithTableProps", () => {
  it("takes the standalone's own props over the widest records", () => {
    expectTypeOf<DataViewsDataChartWithTableProps>().toEqualTypeOf<
      Omit<
        DataChartWithTableProps<readonly SchemaFieldDefinition[]>,
        "provider" | "messages"
      >
    >();
  });

  it("takes no provider and no words, which come from the root", () => {
    expectTypeOf<DataViewsDataChartWithTableProps>().not.toHaveProperty(
      "provider",
    );
    expectTypeOf<DataViewsDataChartWithTableProps>().not.toHaveProperty(
      "messages",
    );
  });
});

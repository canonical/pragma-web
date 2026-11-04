import type {
  DataViewsMessages,
  DataViewsProvider,
  DisplayStatus,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ReactNode } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { DataChartProps, DataChartType } from "./types.js";

type Props = DataChartProps<readonly SchemaFieldDefinition[]>;

describe("DataChartType", () => {
  it("is exactly a bar or a range", () => {
    expectTypeOf<DataChartType>().toEqualTypeOf<"bar" | "range">();
  });
});

describe("DataChartProps", () => {
  it("requires the provider, the type, the field and the label", () => {
    expectTypeOf<Props["provider"]>().toEqualTypeOf<
      DataViewsProvider<readonly SchemaFieldDefinition[], RowRecord>
    >();
    expectTypeOf<Props["type"]>().toEqualTypeOf<DataChartType>();
    expectTypeOf<Props["field"]>().toEqualTypeOf<string>();
    expectTypeOf<Props["label"]>().toEqualTypeOf<string>();
    expectTypeOf<
      Pick<Props, "provider" | "type" | "field" | "label">
    >().toEqualTypeOf<
      Required<Pick<Props, "provider" | "type" | "field" | "label">>
    >();
  });

  it("leaves the status and the words optional", () => {
    expectTypeOf<Props["renderStatus"]>().toEqualTypeOf<
      ((status: DisplayStatus) => ReactNode) | undefined
    >();
    expectTypeOf<Props["messages"]>().toEqualTypeOf<
      Partial<DataViewsMessages> | undefined
    >();
  });

  it("extends native figure props, less the ones the chart sets itself", () => {
    expectTypeOf<Props>().toHaveProperty("className");
    expectTypeOf<Props>().toHaveProperty("id");
    expectTypeOf<Props>().not.toHaveProperty("children");
    expectTypeOf<Props>().not.toHaveProperty("aria-label");
    expectTypeOf<Props>().not.toHaveProperty("aria-labelledby");
    expectTypeOf<Props>().not.toHaveProperty("aria-busy");
  });
});

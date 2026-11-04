import type {
  DataViewsMessages,
  DataViewsProvider,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { describe, expectTypeOf, it } from "vitest";
import type { DataChartProps } from "../DataChart/index.js";
import type { DataTableProps } from "../DataTable/index.js";
import type { DataChartWithTableProps } from "./types.js";

type Fields = readonly SchemaFieldDefinition[];
type Props = DataChartWithTableProps<Fields>;

describe("DataChartWithTableProps", () => {
  it("requires the provider and the chart's and the table's own props", () => {
    expectTypeOf<Props["provider"]>().toEqualTypeOf<
      DataViewsProvider<Fields, RowRecord>
    >();
    expectTypeOf<Props["chartProps"]>().toEqualTypeOf<
      Omit<DataChartProps<Fields, RowRecord>, "provider" | "messages">
    >();
    expectTypeOf<Props["tableProps"]>().toEqualTypeOf<
      Omit<DataTableProps<Fields, RowRecord>, "provider" | "messages">
    >();
    expectTypeOf<
      Pick<Props, "provider" | "chartProps" | "tableProps">
    >().toEqualTypeOf<
      Required<Pick<Props, "provider" | "chartProps" | "tableProps">>
    >();
  });

  it("leaves the name and the words optional", () => {
    expectTypeOf<Props["label"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Props["messages"]>().toEqualTypeOf<
      Partial<DataViewsMessages> | undefined
    >();
  });

  it("gives neither inner part a provider or words of its own", () => {
    expectTypeOf<Props["chartProps"]>().not.toHaveProperty("provider");
    expectTypeOf<Props["chartProps"]>().not.toHaveProperty("messages");
    expectTypeOf<Props["tableProps"]>().not.toHaveProperty("provider");
    expectTypeOf<Props["tableProps"]>().not.toHaveProperty("messages");
  });

  it("extends native section props, less the ones the switch sets itself", () => {
    expectTypeOf<Props>().toHaveProperty("className");
    expectTypeOf<Props>().not.toHaveProperty("children");
    expectTypeOf<Props>().not.toHaveProperty("aria-label");
    expectTypeOf<Props>().not.toHaveProperty("aria-labelledby");
  });
});

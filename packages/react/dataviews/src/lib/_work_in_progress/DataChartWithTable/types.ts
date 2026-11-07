import type {
  DataViewsMessages,
  DataViewsProvider,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ComponentProps } from "react";
import type { DataChartProps } from "../DataChart/index.js";
import type { DataTableProps } from "../DataTable/index.js";

type OwnProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
> = {
  /** The provider the chart and the table both read: one query, one result, one selection. */
  readonly provider: DataViewsProvider<TFields, TRow>;
  /** The chart's own props, less the provider and the words, which it takes from here. */
  readonly chartProps: Omit<
    DataChartProps<TFields, TRow>,
    "provider" | "messages"
  >;
  /** The table's own props, less the provider and the words, which it takes from here. */
  readonly tableProps: Omit<
    DataTableProps<TFields, TRow>,
    "provider" | "messages"
  >;
  /** The switch's accessible name, naming its choice too. Defaults to the messages' `renderer`. */
  readonly label?: string;
  /** The words the chart, the table and the switch render, over English. */
  readonly messages?: Partial<DataViewsMessages>;
};

/**
 * DataChartWithTable props. The root is the renderer switch's `section`,
 * named by `label`, so it extends native section props, less `children`,
 * since what it holds is the chart and the table, and `aria-label` and
 * `aria-labelledby`, which `label` sets.
 *
 * @experimental Pre-release: a work-in-progress prototype, not admitted to
 * the package root; its shape may change or it may be withdrawn.
 */
export type DataChartWithTableProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = OwnProps<TFields, TRow> &
  Omit<
    ComponentProps<"section">,
    | keyof OwnProps<TFields, TRow>
    | "children"
    | "aria-label"
    | "aria-labelledby"
  >;

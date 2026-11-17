import type { SchemaFieldDefinition } from "@canonical/dataviews-core";
import type { DataChartWithTableProps } from "../../../DataChartWithTable/index.js";

/**
 * Props of the connected chart with its table: the standalone's own, less
 * the provider and the words, which come from the enclosing root.
 *
 * @experimental Pre-release: a work-in-progress prototype, not admitted to
 * the package root; its shape may change or it may be withdrawn.
 */
export type DataViewsDataChartWithTableProps = Omit<
  DataChartWithTableProps<readonly SchemaFieldDefinition[]>,
  "provider" | "messages"
>;

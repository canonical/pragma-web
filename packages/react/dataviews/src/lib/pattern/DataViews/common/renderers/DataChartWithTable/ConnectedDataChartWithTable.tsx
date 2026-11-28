import type { RowRecord } from "@canonical/dataviews-core";
import type { ReactElement } from "react";
import { useDataViewsRoot } from "../../../hooks/index.js";
import { narrowRootRecords } from "../../utils/index.js";
import Standalone from "./DataChartWithTable.js";
import type { DataViewsDataChartWithTableProps } from "./types.js";

/**
 * The chart and its table behind one switch, bound to the enclosing root's
 * provider: it draws exactly what the standalone `DataChartWithTable` draws
 * for that provider, reading the root it is placed in and throwing outside
 * one, and taking the root's words rather than resolving its own. So both
 * renderers redraw as the root's filters narrow the query.
 *
 * Not exported from the package root, nor placed on `DataViews`: a
 * work-in-progress prototype, imported from its own module.
 *
 * @implements ds:apps.pattern.data_chart_with_table
 *
 * @experimental Pre-release: a work-in-progress prototype, not admitted to
 * the package root; its shape may change or it may be withdrawn.
 */
export default function ConnectedDataChartWithTable<
  TRow extends object = RowRecord,
>(props: DataViewsDataChartWithTableProps<TRow>): ReactElement {
  const { provider, messages } = useDataViewsRoot("DataChartWithTable");
  return (
    <Standalone
      {...props}
      provider={narrowRootRecords(
        provider,
        props.tableProps.columns,
        "DataTable",
      )}
      messages={messages}
    />
  );
}

ConnectedDataChartWithTable.displayName = "DataViews.DataChartWithTable";

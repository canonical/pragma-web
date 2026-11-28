import type { RowRecord } from "@canonical/dataviews-core";
import type { ReactElement } from "react";
import { useDataViewsRoot } from "../../../hooks/index.js";
import { narrowRootRecords } from "../../utils/index.js";
import DataTable from "./DataTable.js";
import ScopedDataTable from "./ScopedDataTable.js";
import type { DataViewsDataTableProps } from "./types.js";

/**
 * The collection's rows: the DataTable, bound to the enclosing root's
 * provider.
 *
 * It renders exactly what `DataTable` renders for that provider. The
 * difference is where the provider, the words and the announcer come from:
 * this part reads the root it is placed in, and throws outside one, rather
 * than taking a provider or messages of its own, and says what its
 * activations did through the root's one announcer rather than one of its
 * own. Columns from `createColumns` type its records; columns from
 * `createColumns` over another collection throw at mount.
 *
 * `import { DataViews } from "@canonical/dataviews-react";`
 *
 * @implements ds:apps.pattern.datatable
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function ConnectedDataTable<TRow extends object = RowRecord>(
  props: DataViewsDataTableProps<TRow>,
): ReactElement {
  const { provider, messages, announce } = useDataViewsRoot("DataTable");
  return (
    <ScopedDataTable
      {...props}
      provider={narrowRootRecords(provider, props.columns, "DataTable")}
      messages={messages}
      announce={announce}
      settingsMenu={DataTable.SettingsMenu}
    />
  );
}

ConnectedDataTable.displayName = "DataViews.DataTable";

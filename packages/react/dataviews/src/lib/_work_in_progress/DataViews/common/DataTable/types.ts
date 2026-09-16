import type { SchemaFieldDefinition } from "@canonical/dataviews-core";
import type { ReactElement } from "react";
import type { DataTableProps } from "../../../DataTable/index.js";

/**
 * Props of the connected table: the table's own, less what the enclosing
 * root supplies — the provider, and the words its parts speak. The records
 * are the widest shape, since the root's provider may have been built over
 * any collection; a custom cell narrows them through
 * `useDataViewsCell(collection)`. Its footer holds the root's pagination bar
 * unless it is given another, so it alone also takes null, for none.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DataViewsDataTableProps = Omit<
  DataTableProps<readonly SchemaFieldDefinition[]>,
  "provider" | "messages" | "footer"
> & {
  /** The footer: the root's pagination bar unless another is given, or null for none. */
  readonly footer?: ReactElement | null | undefined;
};

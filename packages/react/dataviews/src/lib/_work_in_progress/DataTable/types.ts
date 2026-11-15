/** The table's public props. */

import type {
  DataViewsMessages,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ScopedDataTableProps } from "../common/index.js";

/**
 * DataTable props: a native table's, less `children` and the ARIA naming
 * and state the table sets. `className`, `style` and `ref` merge with the
 * table's own.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DataTableProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = Omit<ScopedDataTableProps<TFields, TRow>, "messages" | "announce"> & {
  /**
   * The words the table renders and announces, over the English record: a
   * standalone table is its own root. The connected table takes its root's
   * instead. Define a worded message once — a new function on every render
   * re-renders every heading, menu and row checkbox that reads it.
   */
  readonly messages?: Partial<DataViewsMessages>;
};

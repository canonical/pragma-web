import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import type { DataTableColumn } from "../types.js";

/**
 * Props of one rendered body cell.
 *
 * Exempt from the native-prop extension convention: an internal renderer
 * deriving its root from the row channels and column model, not forwarding a
 * caller's native props.
 */
export type BodyCellProps<TRow extends object> = {
  /** The provider's collection, which witnesses the cell's scope. */
  readonly provider: Pick<
    DataViewsProvider<readonly SchemaFieldDefinition[], TRow>,
    "collection"
  >;
  readonly channels: RowChannels<TRow>;
  readonly column: DataTableColumn;
  readonly field: string;
};

import type {
  Applicability,
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import type { Ref } from "react";
import type { DataTableColumn } from "../../types.js";

/**
 * Props of one rendered data row.
 *
 * Exempt from the native-prop extension convention: an internal renderer
 * deriving its root from the row channels and column model, not forwarding a
 * caller's native props.
 */
export type RowProps<TRow extends object> = {
  /**
   * What the row and the cells it draws read of the provider: the collection
   * a cell's scope is witnessed by, and the selection its checkbox toggles.
   * Only those, so a provider typed over its own field list is one of these
   * without being widened to a shape its commands no longer answer.
   */
  readonly provider: Pick<
    DataViewsProvider<readonly SchemaFieldDefinition[], TRow>,
    "collection" | "selection"
  >;
  readonly channels: RowChannels<TRow>;
  readonly columns: readonly DataTableColumn[];
  readonly selectable: boolean;
  /**
   * Names a record for its checkbox, or answers null where the caller gave
   * no name.
   */
  readonly rowLabel: (row: TRow, rowId: string) => string | null;
  /**
   * Whether one column applies to a record of one declared type, or of
   * none: its field's own scope, narrowed by the column's where it declares
   * one. The table's, one identity for every row, so a row that re-renders
   * renders no cell again for it; the row asks per column rather than
   * carrying a map it would have to rebuild whenever its record moved.
   */
  readonly applicabilityOf: (
    column: DataTableColumn,
    type: string | null,
  ) => Applicability;
  /**
   * The declared type a record carries, or null: what the row watches of its
   * record. The table's, one identity for every row.
   */
  readonly typeOf: (record: TRow) => string | null;
  /** The row's logical position, reported only by a virtualized table. */
  readonly position?: number | undefined;
  /** The row element, for a virtualized table to measure. */
  readonly ref?: Ref<HTMLDivElement> | undefined;
};

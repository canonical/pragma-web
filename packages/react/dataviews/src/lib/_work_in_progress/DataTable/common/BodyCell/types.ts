import type {
  Applicability,
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import type { DataTableColumn } from "../../types.js";

/**
 * Props of one rendered body cell.
 *
 * Exempt from the native-prop extension convention: an internal renderer
 * deriving its root from the row channels and column model, not forwarding a
 * caller's native props.
 */
export type BodyCellProps<TRow extends object> = {
  /**
   * What the cell reads of the provider: the collection its scope is
   * witnessed by. Only that, so a provider typed over its own field list is
   * one of these without being widened.
   */
  readonly provider: Pick<
    DataViewsProvider<readonly SchemaFieldDefinition[], TRow>,
    "collection"
  >;
  readonly channels: RowChannels<TRow>;
  readonly column: DataTableColumn;
  readonly field: string;
  /** The element's id, given to the row header's cell so the row is named by it. */
  readonly id?: string | undefined;
  /**
   * Whether this column's field applies to the record in this row. Derived
   * once by the table from the collection's scoping rather than read per
   * cell, and handed to a column's own content, which may draw it otherwise.
   */
  readonly applicability: Applicability;
  /**
   * The declared type of the record, or null: a cell compares it and draws
   * again when it moves, so content narrowing on the record reads its current
   * type even where the field's value and applicability did not move.
   */
  readonly recordType: string | null;
};

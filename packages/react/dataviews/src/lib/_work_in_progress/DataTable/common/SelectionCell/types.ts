import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";

/**
 * Props of one row's selection cell.
 *
 * Exempt from the native-prop extension convention: an internal renderer
 * deriving its root from the row channels, not forwarding a caller's native
 * props.
 */
export type SelectionCellProps<TRow extends object> = {
  /**
   * What the cell reads of the provider: the selection its checkbox toggles.
   * Only that, so a provider typed over its own field list is one of these
   * without being widened.
   */
  readonly provider: Pick<
    DataViewsProvider<readonly SchemaFieldDefinition[], TRow>,
    "selection"
  >;
  readonly channels: RowChannels<TRow>;
  readonly selected: boolean;
  readonly rowLabel: (row: TRow, rowId: string) => string;
};

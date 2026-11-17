import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import type { ComponentProps } from "react";

type OwnProps<TRow extends object> = {
  /** The provider whose selection the checkbox toggles the row in. */
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[], TRow>;
  /** The row's channels: its record, for the name, and its identity. */
  readonly channels: RowChannels<TRow>;
  /** Whether the row is selected, as the row itself reads it. */
  readonly selected: boolean;
  /** The record's name, which the checkbox's name is built from. */
  readonly rowLabel: (row: TRow, rowId: string) => string;
};

/**
 * Props of one row's selection cell: its own, and the native props of the
 * `div` it renders as its root. The cell owns its role, so that is not
 * taken.
 */
export type SelectionCellProps<TRow extends object> = OwnProps<TRow> &
  Omit<ComponentProps<"div">, keyof OwnProps<TRow> | "children" | "role">;

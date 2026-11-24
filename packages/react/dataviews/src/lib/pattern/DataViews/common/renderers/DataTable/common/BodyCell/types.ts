import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type {
  ProviderHost,
  RowChannels,
} from "@canonical/dataviews-core/bindings";
import type { ComponentProps } from "react";
import type { DataTableColumn } from "../types.js";

type OwnProps<TRow extends object> = {
  /** The provider's collection, which witnesses the cell's scope. */
  readonly provider: Pick<
    DataViewsProvider<readonly SchemaFieldDefinition[], TRow>,
    "collection"
  >;
  /** The row's channels, from the table's row scopes. */
  readonly channels: RowChannels<TRow>;
  /** The column the cell draws. */
  readonly column: DataTableColumn<TRow>;
  /** The column's field name on the record. */
  readonly field: string;
  /** Whether a field applies to a record, from the provider's host. */
  readonly readApplicability: ProviderHost<
    readonly SchemaFieldDefinition[],
    TRow
  >["readApplicability"];
};

/** Props of one body cell: its own, and the native props of its `td`. */
export type BodyCellProps<TRow extends object> = OwnProps<TRow> &
  Omit<ComponentProps<"td">, keyof OwnProps<TRow> | "children">;

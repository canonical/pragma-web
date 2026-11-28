import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import type { ComponentProps } from "react";
import type { DataTableColumn } from "../types.js";

type OwnProps<TRow extends object> = {
  /** The provider's collection, which witnesses the cell's scope. */
  readonly provider: Pick<
    DataViewsProvider<readonly SchemaFieldDefinition[], TRow>,
    "collection"
  >;
  readonly channels: RowChannels<TRow>;
  readonly column: DataTableColumn;
  readonly field: string;
};

/** Props of one body cell: its own, and the native props of its `td`. */
export type BodyCellProps<TRow extends object> = OwnProps<TRow> &
  Omit<ComponentProps<"td">, keyof OwnProps<TRow> | "children">;

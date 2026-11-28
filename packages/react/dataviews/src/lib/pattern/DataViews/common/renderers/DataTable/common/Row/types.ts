import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import type { ComponentProps, Ref } from "react";
import type { DataTableColumn } from "../types.js";

type OwnProps<TRow extends object> = {
  /** The provider's collection and selection, all its cells read. */
  readonly provider: Pick<
    DataViewsProvider<readonly SchemaFieldDefinition[], TRow>,
    "collection" | "selection"
  >;
  readonly channels: RowChannels<TRow>;
  readonly columns: readonly DataTableColumn[];
  readonly selectable: boolean;
  readonly getRowLabel: (row: TRow, rowId: string) => string;
  /** The row's logical position, reported only by a virtualized table. */
  readonly position?: number | undefined;
  /** The unmounted space before the row, drawn as its top margin. */
  readonly gap?: number | undefined;
  /** The row element, for a virtualized table to measure. */
  readonly ref?: Ref<HTMLTableRowElement> | undefined;
};

/** Props of one data row: its own, and the native props of its `tr`. */
export type RowProps<TRow extends object> = OwnProps<TRow> &
  Omit<ComponentProps<"tr">, keyof OwnProps<TRow> | "children">;

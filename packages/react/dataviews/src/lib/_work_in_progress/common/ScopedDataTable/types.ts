import type {
  DataViewsMessages,
  DataViewsProvider,
  DisplayStatus,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import type {
  AnnouncerTopic,
  DataTableVirtualization,
} from "../../../common/index.js";
import type { DataTableColumn } from "./common/index.js";

type OwnProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
> = {
  /** The provider owning this collection's query, result and selection. */
  readonly provider: DataViewsProvider<TFields, TRow>;
  /**
   * The columns, in declared order; the presentation decides which show and
   * where.
   */
  readonly columns: readonly DataTableColumn[];
  /** The table's accessible name. */
  readonly label: string;
  /** Render a leading selection column backed by the provider's selection. */
  readonly selectable?: boolean;
  /** Names a record for its selection checkbox; defaults to its id. */
  readonly getRowLabel?: (row: TRow, rowId: string) => string;
  /** Replaces a status's message text. */
  readonly renderStatus?: (status: DisplayStatus) => ReactNode;
  /** Mounts only the rows near the viewport, from `virtualizeRows`. */
  readonly virtualization?: DataTableVirtualization;
  /**
   * What the header's settings cell holds, such as `<DataViews.Settings />`.
   */
  readonly settings?: ReactElement | undefined;
};

/**
 * Props of the table's body within its UI scope: the table's own and a
 * native table's, with the words and the announcer it speaks through
 * supplied rather than resolved. Never exported from the package.
 */
export type ScopedDataTableProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = OwnProps<TFields, TRow> &
  Omit<
    ComponentProps<"table">,
    | keyof OwnProps<TFields, TRow>
    | "children"
    | "role"
    | "aria-label"
    | "aria-labelledby"
    | "aria-busy"
    | "aria-rowcount"
  > & {
    /** Every message the table renders and announces, resolved. */
    readonly messages: DataViewsMessages;
    /** Say an outcome through the announcer of the table's UI scope. */
    readonly announce: (message: ReactNode, topic?: AnnouncerTopic) => void;
  };

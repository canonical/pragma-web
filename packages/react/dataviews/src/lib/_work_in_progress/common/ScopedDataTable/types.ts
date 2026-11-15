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
   * The columns, in their declared order. The provider's presentation
   * decides which show, in what order and at what width; the declaration
   * is the lowest layer, standing where nothing is stored.
   */
  readonly columns: readonly DataTableColumn[];
  /** The table's accessible name. */
  readonly label: string;
  /** Render a leading selection column backed by the provider's selection. */
  readonly selectable?: boolean;
  /**
   * Names one record, for its selection checkbox. Defaults to its
   * identity. Written as a lambda it costs nothing: the table always calls
   * the latest one and never re-renders a row because the function is new.
   */
  readonly getRowLabel?: (row: TRow, rowId: string) => string;
  /**
   * Replaces the messages' text of a status: no rows to render, or rows that
   * no longer answer the current query. The status is the core's, decided
   * once from the collection's state. Held the same way as `getRowLabel`
   * while rows show alone: the latest one is always called, and its
   * identity alone never re-renders a row. While a status shows, the newest
   * renderer is drawn at once.
   */
  readonly renderStatus?: (status: DisplayStatus) => ReactNode;
  /**
   * Mount only the rows near the viewport, from `virtualizeRows`. The table
   * becomes its own scroll viewport, no taller than the screen unless its
   * style says otherwise, and reports each row's logical position so that
   * a row not mounted is still counted. Omitted, every row is rendered.
   */
  readonly virtualization?: DataTableVirtualization;
  /**
   * What the header's settings cell holds: `<DataViews.Settings />`, which
   * the table hands its columns, their arrangement and the commands that
   * change them. Left out, the header has no settings cell.
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

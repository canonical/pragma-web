/**
 * The table's public contract — its props, columns, cells and the
 * virtualization descriptor it takes — with the body shapes the virtualization
 * entry point fills in. Together because a column and a cell are read by
 * the same renderer from the same props.
 */

import type {
  DataViewsMessages,
  DataViewsProvider,
  DisplayStatus,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ColumnSizing } from "@canonical/dataviews-core/bindings";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import type {
  AnnouncerTopic,
  DataTableVirtualization,
  DisplayField,
} from "../../common/index.js";

export type { DataTableVirtualization } from "../../common/index.js";

/**
 * One rendered column: a display field, with what only a column adds — its
 * sizing, whether it resizes, sorts from its header and may be hidden.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DataTableColumn = DisplayField & {
  /**
   * This column's cell is the row's header: it names the row, so a reader
   * hears its text before each of the row's other cells, and the row's
   * selection checkbox is named by it unless `rowLabel` names the row. A
   * table has at most one, and it is never hidden — hiding it would take
   * the row's name with it — so `hideable` reads as false on it.
   */
  readonly rowHeader?: boolean;
  /** Declared sizing. Defaults to a flexible column with a 96px minimum. */
  readonly sizing?: ColumnSizing;
  /**
   * Whether the viewer may hide this column through the collection's
   * presentation. Defaults to true; a column declared `false` shows
   * whatever the arrangement says, so a table always has the column an
   * application cannot do without.
   */
  readonly hideable?: boolean;
  /**
   * Offer sorting on this column's field. Honoured only when the source's
   * declaration, which the provider carries, names the field sortable and
   * allows at least one sort term, so the table never offers an ordering
   * the source would refuse; on any other field this offers nothing.
   */
  readonly sortable?: boolean;
  /**
   * Offer resizing of this column from its trailing edge, by pointer or
   * keyboard, held to the declared bounds of its sizing every time.
   *
   * The last column never offers it, whatever this says: its trailing edge is
   * the table's own edge, with nothing beyond it to resize against. It takes
   * whatever width the columns before it leave — past its own `maxPx` or
   * fixed width when there is room to spare — so it grows and shrinks as they
   * are resized, and keeps its resolved width once they no longer fit and the
   * table scrolls.
   */
  readonly resizable?: boolean;
};

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
  /**
   * The words the table renders and announces, over the English record: a
   * standalone table is its own root. The connected table takes its root's
   * instead. Define a worded message once — a new function on every render
   * re-renders every heading, menu and row checkbox that reads it.
   */
  readonly messages?: Partial<DataViewsMessages>;
  /** Render a leading selection column backed by the provider's selection. */
  readonly selectable?: boolean;
  /**
   * Names one record, for its selection checkbox. Defaults to the text of
   * the row header's cell where a column is the row header, and to the
   * record's identity otherwise. Written as a lambda it costs nothing: the
   * table always calls the latest one and never re-renders a row because
   * the function is new.
   */
  readonly rowLabel?: (row: TRow, rowId: string) => string;
  /**
   * Replaces the messages' text of a status: no rows to render, or rows that
   * no longer answer the current query. The status is the core's, decided
   * once from the collection's state. Held the same way as `rowLabel`
   * while rows show alone: the latest one is always called, and its
   * identity alone never re-renders a row. While a status shows, the newest
   * renderer is drawn at once.
   */
  readonly renderStatus?: (status: DisplayStatus) => ReactNode;
  /**
   * Mount only the rows near the viewport, from `virtualizeRows`. The table
   * becomes its own scroll viewport, no taller than the screen unless a
   * height capped on its frame says otherwise, and reports each row's
   * logical position so that
   * a row not mounted is still counted. Omitted, every row is rendered.
   */
  readonly virtualization?: DataTableVirtualization;
  /**
   * What the header's settings cell holds: `<DataViews.Settings />`, which
   * the table hands its columns, their arrangement and the commands that
   * change them. Left out, the header has no settings cell.
   */
  readonly settings?: ReactElement | undefined;
  /**
   * What the frame's footer holds, beneath the table and outside its role:
   * the pagination bar, a landmark and not a row. It keeps to the bottom of
   * the view while a table taller than the view scrolls past, and to the
   * bottom of the frame where the frame's height is capped. Left out, the
   * frame has no footer. The connected table places `<DataViews.Pagination />`
   * here unless it is given another footer, or null for none — the one
   * spelling it adds, since only it has a footer by default.
   */
  readonly footer?: ReactElement | undefined;
};

/**
 * DataTable props. The root is the frame: a `div` holding the table, its
 * footer and, for a standalone table, its announcer, so the props extend
 * native div props, less the ones the table owns: `children`, because the
 * frame's content is the table, which it renders itself; and `role`,
 * `aria-label`, `aria-labelledby`, `aria-busy` and `aria-rowcount`, each of
 * which the table sets on its own element from what it knows. `className`,
 * `style` and `ref` are merged onto the frame with the table's own rather
 * than clobbered by either side.
 *
 * `ref` is honoured in both React forms: a callback ref that returns a
 * cleanup has that cleanup called on detach, and one that returns nothing is
 * called with `null` instead. A callback ref rebuilt on every render costs
 * nothing — the table holds the latest rather than re-attaching.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DataTableProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = OwnProps<TFields, TRow> &
  Omit<
    ComponentProps<"div">,
    | keyof OwnProps<TFields, TRow>
    | "children"
    | "role"
    | "aria-label"
    | "aria-labelledby"
    | "aria-busy"
    | "aria-rowcount"
  >;

/**
 * Props of the table's body within its UI scope: the table's own, with the
 * words and the announcer it speaks through supplied rather than resolved —
 * by a standalone table from its own, by a connected one from its root.
 * Never exported from the package: it is how the two tables share one body.
 */
export type ScopedDataTableProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = Omit<DataTableProps<TFields, TRow>, "messages"> & {
  /** Every message the table renders and announces, resolved. */
  readonly messages: DataViewsMessages;
  /**
   * The announcer of the table's UI scope, named once: what says an outcome,
   * and the live region it says it through, placed in the frame after the
   * footer. A standalone table brings both; a connected table brings its
   * root's `announce` and no region, since it speaks through the root's.
   */
  readonly announcer: {
    readonly announce: (message: ReactNode, topic?: AnnouncerTopic) => void;
    readonly region: ReactElement | null;
  };
};

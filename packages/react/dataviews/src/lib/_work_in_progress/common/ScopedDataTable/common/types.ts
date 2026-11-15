/**
 * The facts the table's common parts share, which the table derives once for
 * every part that changes a column: the changes a column takes, and each
 * declared column as the arrangement in force places it.
 */

import type { ColumnSizing } from "@canonical/dataviews-core/bindings";
import type { DisplayField } from "../../../../common/index.js";

/**
 * One rendered column: a display field, with what only a column adds — its
 * sizing, whether it resizes, sorts from its header and may be hidden.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DataTableColumn = DisplayField & {
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

/** One change to one column that the table's menus offer. */
export type ColumnChange = "hide" | "show" | "move-left" | "move-right";

/** A change a column's own header menu offers: it is shown, so not Show. */
export type HeaderColumnChange = Exclude<ColumnChange, "show">;

/** Which changes a column takes now, each true where it would do something. */
export type ColumnOffers = Readonly<Record<ColumnChange, boolean>>;

/** Which changes a column's own header menu offers now. */
export type HeaderColumnOffers = Readonly<Record<HeaderColumnChange, boolean>>;

/** One declared column as the settings menu offers it. */
export type ColumnSetting = {
  readonly column: DataTableColumn;
  /** Whether the arrangement in force hides the column. */
  readonly hidden: boolean;
  /**
   * Which changes the column takes now, each true only where it would change
   * the arrangement: never hiding the last column shown or one declared
   * `hideable: false`, never moving a hidden column or one past either end.
   */
  readonly offers: ColumnOffers;
};

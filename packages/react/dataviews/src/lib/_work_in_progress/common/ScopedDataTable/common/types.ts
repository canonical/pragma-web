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
  /** Declared sizing; defaults to flexible with a 96px minimum. */
  readonly sizing?: ColumnSizing;
  /** Whether the viewer may hide the column; defaults to true. */
  readonly hideable?: boolean;
  /** Offers sorting from the header, where the source can sort the field. */
  readonly sortable?: boolean;
  /**
   * Offers resizing from the trailing edge, within its sizing bounds; never on
   * the last column.
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

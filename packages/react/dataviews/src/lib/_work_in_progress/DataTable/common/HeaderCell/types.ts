/**
 * The header cell's contract — its props — and the one ordering fact it
 * renders from, a column's precedence, which the table derives once per
 * ordering and hands to every header.
 */

import type { SortDirection } from "@canonical/dataviews-core";
import type {
  GridInteraction,
  SizingBounds,
} from "@canonical/dataviews-core/bindings";
import type { ComponentProps, ReactNode } from "react";
import type { DataTableColumn } from "../../types.js";
import type { HeaderColumnChange, HeaderColumnOffers } from "../types.js";

/** Where one column's field stands in the ordering in force. */
export type SortPrecedence = {
  readonly direction: SortDirection;
  /** One-based precedence among the ordering's terms. */
  readonly position: number;
  /** How many terms the ordering has. */
  readonly count: number;
};

type OwnProps = {
  /** The column this header names, sorts and resizes. */
  readonly column: DataTableColumn;
  /**
   * Whether this header offers sorting: the column asks for it and the
   * provider's capabilities declare its field sortable and allow at least
   * one sort term.
   */
  readonly sortable: boolean;
  /**
   * Where this column's field stands in the ordering in force — the query's
   * own terms, or the source's default when it states none — or null when
   * the ordering does not name it. Shown whether or not the column offers
   * sorting: a column the rows are ordered by says so.
   */
  readonly precedence: SortPrecedence | null;
  /**
   * Whether this header carries `aria-sort`: the column of the ordering's
   * first term, and only the first column showing that field. Every other
   * header omits it, so exactly one claims the sort.
   */
  readonly primary: boolean;
  /**
   * The destination a plain activation leads to without scripting — the
   * next ordering, from the first page, as `?query` — or null where the
   * provider has no location to lead to.
   */
  readonly destination: string | null;
  /**
   * Whether scripts have taken over. Before then a sortable header is its
   * link, or a plain label without a destination; after, a button.
   */
  readonly hydrated: boolean;
  /**
   * Why the last activation of this header changed nothing, worded, or null:
   * shown beside the control while it stands, and said by the table's
   * announcer when it happened.
   */
  readonly reason: string | null;
  /**
   * Activate a column's sort, as a further term when `additive`. This,
   * `onPlace`, `onRemoveFromSort` and `onClearRefusal` are the table's, one
   * identity for every column, so a render of the header row renders no
   * column's menu again. Each takes the column's id alone: the table reads
   * the column's field itself.
   */
  readonly onSort: (columnId: string, additive: boolean) => void;
  /**
   * Whether the reader's own ordering names this column, so its menu can
   * remove it.
   */
  readonly removable: boolean;
  /** Sort by a column in a direction, from its menu. */
  readonly onPlace: (columnId: string, direction: SortDirection) => void;
  /** Take a column out of the reader's ordering, from its menu. */
  readonly onRemoveFromSort: (columnId: string) => void;
  /**
   * Which changes to its visibility and place the column takes now. The
   * table's, one object per column while the arrangement holds.
   */
  readonly offers: HeaderColumnOffers;
  /** Hide or move a column, from its menu; one identity for every column. */
  readonly onChangeColumn: (
    columnId: string,
    change: HeaderColumnChange,
  ) => void;
  /** Let a refusal's reason go, once focus leaves the header and its menu. */
  readonly onClearRefusal: () => void;
  /** The table's grid interaction, which every resize path commands. */
  readonly interaction: GridInteraction;
  /**
   * Offer a resize handle at this header cell's trailing edge. False for the
   * last column whatever it declares: its trailing edge is the table's own
   * edge.
   */
  readonly resizable: boolean;
  /**
   * The widths a resize may leave this column at, from the declared sizing
   * the table's widths are solved from.
   */
  readonly bounds: SizingBounds;
  /** The column's resolved width, for a resize capture. */
  readonly width: number;
  /** The id this header's label carries, for the resize handle's name. */
  readonly labelId: string;
  /**
   * Say something through the table's announcer: the resize handle's hint
   * as a press starts placing the column's edge.
   */
  readonly announce: (message: ReactNode) => void;
};

/**
 * Props of one header cell: its own, and the native props of the `div` it
 * renders as its root. The cell owns its role, its name, its sort state,
 * its description and its blur, all derived from the column and the
 * ordering in force, so those are not taken.
 */
export type HeaderCellProps = OwnProps &
  Omit<
    ComponentProps<"div">,
    | keyof OwnProps
    | "children"
    | "role"
    | "aria-labelledby"
    | "aria-sort"
    | "aria-describedby"
    | "onBlur"
  >;

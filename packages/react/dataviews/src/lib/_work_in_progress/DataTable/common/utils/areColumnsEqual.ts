import { areListsEqual } from "@canonical/dataviews-core/bindings";
import type { DataTableColumn } from "../../types.js";
import areBodyColumnsEqual from "./areBodyColumnsEqual.js";

/**
 * Whether two column arrays say the same thing about everything the
 * rendered tree reads: what a body row reads, and what the header row and
 * the column menus read besides — each heading, by reference, since a node
 * has no content this could compare, and whether it sorts, resizes and
 * hides. Kept apart from the body's reading, because an inline `header`
 * node must cost a redraw of the header row alone.
 */
export default function areColumnsEqual(
  a: readonly DataTableColumn[],
  b: readonly DataTableColumn[],
): boolean {
  return (
    areBodyColumnsEqual(a, b) &&
    areListsEqual(
      a,
      b,
      (column, other) =>
        column.header === other.header &&
        column.sortable === other.sortable &&
        column.resizable === other.resizable &&
        column.hideable === other.hideable,
    )
  );
}

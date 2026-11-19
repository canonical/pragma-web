import { DESCENDING_SORT_PREFIX } from "@canonical/prism-core";
import type { ListSort } from "./types.js";

/**
 * The `sort` value a column's header link writes: its field ascending, or
 * descending when the list is already sorted ascending by it.
 *
 * @param field - The column's field.
 * @param sort - The list's current order, or null.
 * @returns The address's next `sort` value.
 */
export default function writeNextSort(
  field: string,
  sort: ListSort | null,
): string {
  return sort?.field === field && !sort.descending
    ? `${DESCENDING_SORT_PREFIX}${field}`
    : field;
}

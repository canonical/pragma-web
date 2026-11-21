import { DESCENDING_SORT_PREFIX } from "@canonical/prism-core";
import type { ListSort } from "./types.js";

/**
 * The order a `sort` value names: its field, and whether it runs
 * descending (`-<field>`) or ascending (`<field>`).
 *
 * @param sort - The address's `sort` value, when it carries one.
 * @returns The order, or null when there is no value or no field in it.
 */
export default function readListSort(
  sort: string | undefined,
): ListSort | null {
  if (sort === undefined) return null;
  const descending = sort.startsWith(DESCENDING_SORT_PREFIX);
  const field = descending ? sort.slice(DESCENDING_SORT_PREFIX.length) : sort;
  return field === "" ? null : { field, descending };
}

/**
 * Moves a highlight by `offset` through `count` items and wraps at both ends,
 * as downshift's `getHighlightedIndex` does for a combobox (no disabled
 * items). A highlight outside the list starts from the matching end, so a step
 * down from nothing lands on the first item and a step up on the last.
 * @note Pure.
 */
export default function getHighlightedIndex(
  start: number,
  offset: number,
  count: number,
): number {
  if (count === 0) return -1;
  const last = count - 1;
  const from = start < 0 || start > last ? (offset > 0 ? -1 : count) : start;
  const next = from + offset;
  if (next < 0) return last;
  if (next > last) return 0;
  return next;
}

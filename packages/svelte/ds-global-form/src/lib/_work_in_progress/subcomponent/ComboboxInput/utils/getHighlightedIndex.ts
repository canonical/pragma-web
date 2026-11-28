/**
 * Moves a highlight by `offset` through `count` items, as downshift's
 * `getHighlightedIndex` does for a combobox (no disabled items). A highlight
 * outside the list starts from the matching end, so a step down from nothing
 * lands on the first item and a step up on the last. With `isCircular`, a move
 * past either end wraps to the other, as the arrow keys do; without it, the
 * move stops at the end, as the WAI-ARIA listbox pattern asks of PageUp and
 * PageDown.
 * @note Pure.
 */
export default function getHighlightedIndex(
  start: number,
  offset: number,
  count: number,
  isCircular: boolean,
): number {
  if (count === 0) return -1;
  const last = count - 1;
  const from = start < 0 || start > last ? (offset > 0 ? -1 : count) : start;
  const next = from + offset;
  if (next < 0) return isCircular ? last : 0;
  if (next > last) return isCircular ? 0 : last;
  return next;
}

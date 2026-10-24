/**
 * Cut a label to what a box holds: the server measures no text, so the cut
 * is by character count, ending in an ellipsis. The box's title keeps the
 * full label.
 *
 * @param label - The label to fit.
 * @param characters - How many characters the box holds, the ellipsis
 *   included.
 * @returns The label when it fits, or its first `characters - 1`
 *   characters and an ellipsis.
 */
export default function truncateLabel(
  label: string,
  characters: number,
): string {
  return label.length <= characters
    ? label
    : `${label.slice(0, characters - 1)}…`;
}

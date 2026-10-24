import { LABEL_CHARACTERS } from "./constants.js";

/**
 * Cut a hop's label to what fits its node: the server measures no text, so
 * the cut is by character count, ending in an ellipsis. The node's title
 * keeps the full label.
 *
 * @param label - The hop's label.
 * @returns The label, or its first characters and an ellipsis.
 */
export default function truncateLabel(label: string): string {
  return label.length <= LABEL_CHARACTERS
    ? label
    : `${label.slice(0, LABEL_CHARACTERS - 1)}…`;
}

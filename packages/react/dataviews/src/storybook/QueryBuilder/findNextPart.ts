import { PARTS } from "./constants.js";
import type { Part, QueryState } from "./types.js";

/**
 * The part Tab or Shift+Tab moves the open edit to: the next or previous
 * part, so Shift+Tab from a draft's operator returns to its field.
 *
 * @param state - The query being built.
 * @param backward - Whether the move is Shift+Tab.
 * @returns The part, or nothing when the edit is at its first or last part.
 */
export default function findNextPart(
  state: QueryState,
  backward: boolean,
): Part | undefined {
  const { edit } = state;
  const clause = state.clauses.find(({ id }) => id === edit?.id);
  if (!edit || !clause) return undefined;
  const index = PARTS.indexOf(edit.part);
  const next = index + (backward ? -1 : 1);
  return next >= 0 ? PARTS.at(next) : undefined;
}

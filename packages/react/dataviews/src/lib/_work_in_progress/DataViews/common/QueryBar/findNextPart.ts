import listParts from "./listParts.js";
import type { QueryBarDraft, QueryBarPart } from "./types.js";

/**
 * The part Tab or Shift+Tab moves the Entry to: the next or the previous
 * of the clause's parts, so Shift+Tab from a draft's operator returns to
 * its field. Null past the last part or before the first, where the move
 * commits the chip instead. Pure.
 *
 * @param draft - The clause in the Entry's chip.
 * @param part - The part the Entry takes.
 * @param backward - Whether the move is Shift+Tab.
 * @returns The part, or null at either end.
 */
export default function findNextPart(
  draft: QueryBarDraft,
  part: QueryBarPart,
  backward: boolean,
): QueryBarPart | null {
  const parts = listParts(draft);
  const next = parts.indexOf(part) + (backward ? -1 : 1);
  return next >= 0 ? (parts.at(next) ?? null) : null;
}

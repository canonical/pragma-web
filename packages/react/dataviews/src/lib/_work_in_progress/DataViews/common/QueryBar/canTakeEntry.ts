import type { QueryBarDraft, QueryBarPart } from "./types.js";

/**
 * Whether a part of a clause can take the Entry: a chip keeps at least one
 * Segment, so another of its parts must hold a value. A draft's field,
 * before its operator is chosen, is its only Segment. Pure.
 *
 * @param draft - The clause in the chip.
 * @param part - The part the Entry would take.
 * @returns Whether the Entry can move there.
 */
export default function canTakeEntry(
  draft: QueryBarDraft,
  part: QueryBarPart,
): boolean {
  return draft.kind === "search" || part !== "field" || draft.operator !== null;
}

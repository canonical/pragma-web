import type { QueryBarDraft, QueryBarPart } from "./types.js";

/**
 * The first part a clause still lacks: its operator, then a value, which
 * presence brings with its operator. Null once it is complete, as the
 * search always is. Pure.
 *
 * @param draft - The clause.
 * @returns The missing part, or null.
 */
export default function findMissingPart(
  draft: QueryBarDraft,
): QueryBarPart | null {
  if (draft.kind === "search") return null;
  if (draft.operator === null) return "operator";
  return draft.operands.length === 0 ? "value" : null;
}

import type { QueryBarDraft, QueryBarPart } from "./types.js";

/**
 * A clause's parts, in the order the chip shows them and Tab walks them:
 * field, operator and value; presence takes its value with its operator,
 * and the search is its one part. Pure.
 *
 * @param draft - The clause.
 * @returns Its parts, in order.
 */
export default function listParts(
  draft: QueryBarDraft,
): readonly QueryBarPart[] {
  if (draft.kind === "search") return ["search"];
  return draft.operator === "isSet"
    ? ["field", "operator"]
    : ["field", "operator", "value"];
}

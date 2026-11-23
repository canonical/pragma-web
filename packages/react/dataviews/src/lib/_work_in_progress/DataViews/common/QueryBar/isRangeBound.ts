import type { QueryBarDraft } from "./types.js";

/**
 * Whether a draft edits one bound of a range chip, whose Entry takes only
 * the bound's value. Pure.
 *
 * @param draft - The draft.
 * @returns Whether it stands in a range's chip.
 */
export default function isRangeBound(draft: QueryBarDraft): boolean {
  return (
    draft.kind === "predicate" &&
    draft.origin !== null &&
    draft.origin.id === `${draft.origin.ref.field}__range`
  );
}

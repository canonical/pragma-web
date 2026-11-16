import { DRAFT_ID } from "./constants.js";
import type { QueryBarDraft } from "./types.js";

/**
 * The id of the chip a draft stands in: the edited clause's, or the chip
 * being built. Pure.
 *
 * @param draft - The draft.
 * @returns The chip's id, which prefixes its roving items.
 */
export default function readDraftId(draft: QueryBarDraft): string {
  return draft.origin?.id ?? DRAFT_ID;
}

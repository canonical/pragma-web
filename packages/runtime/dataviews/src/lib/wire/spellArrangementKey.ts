import { ARRANGEMENT_QUERY_PREFIX } from "./constants.js";
import spellTableId from "./spellTableId.js";
import type { ArrangementKeyPart } from "./types.js";

/** The key or parameter one table keeps a part of its arrangement under. */
export default function spellArrangementKey(
  table: string,
  part: ArrangementKeyPart,
): string {
  return `${ARRANGEMENT_QUERY_PREFIX}${spellTableId(table)}.${part}`;
}

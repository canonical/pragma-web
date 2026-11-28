import { ARRANGEMENT_KEY_PARTS } from "./constants.js";
import type { ArrangementKeyPart } from "./types.js";

/**
 * A table's id as its keys spell it: encoded, so it holds no dot, and with
 * a part's name encoded too, so no old key reads as a table's.
 */
export default function spellTableId(table: string): string {
  const spelled = encodeURIComponent(table).replaceAll(".", "%2E");
  return ARRANGEMENT_KEY_PARTS.includes(spelled as ArrangementKeyPart)
    ? `%${spelled.charCodeAt(0).toString(16).toUpperCase()}${spelled.slice(1)}`
    : spelled;
}

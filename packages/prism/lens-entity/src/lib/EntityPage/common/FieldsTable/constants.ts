import type { MessageKey } from "../../../i18n/index.js";

/**
 * The catalog key of each property kind the contract names. A kind a newer
 * contract adds has no key here, and the table shows its raw name.
 */
export const KIND_MESSAGES: ReadonlyMap<string, MessageKey> = new Map([
  ["DATATYPE", "kind.DATATYPE"],
  ["OBJECT", "kind.OBJECT"],
  ["ANNOTATION", "kind.ANNOTATION"],
]);

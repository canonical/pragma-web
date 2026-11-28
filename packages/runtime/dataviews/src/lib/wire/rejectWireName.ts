import { OPERATOR_DELIMITER } from "./constants.js";
import isReservedKey from "./isReservedKey.js";

/** Why a field name cannot be spelled on the wire, or null when it can. */
export default function rejectWireName(field: string): string | null {
  if (field.includes(OPERATOR_DELIMITER)) {
    return `field name "${field}" must not contain "${OPERATOR_DELIMITER}"`;
  }
  if (isReservedKey(field)) {
    return `field name "${field}" is a reserved query parameter`;
  }
  return null;
}

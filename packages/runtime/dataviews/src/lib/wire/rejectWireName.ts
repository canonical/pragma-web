import { OPERATOR_DELIMITER } from "./constants.js";
import isReservedKey from "./isReservedKey.js";

/** Why a field name, or a segment of its dot path, cannot be spelled on the wire; null when it can. */
export default function rejectWireName(field: string): string | null {
  if (isReservedKey(field)) {
    return `field name "${field}" is a reserved query parameter`;
  }
  for (const segment of field.split(".")) {
    if (segment === "") {
      return `field name "${field}" has a segment with no name`;
    }
    if (segment.includes(OPERATOR_DELIMITER)) {
      return `field name "${field}" must not contain "${OPERATOR_DELIMITER}"`;
    }
  }
  return null;
}

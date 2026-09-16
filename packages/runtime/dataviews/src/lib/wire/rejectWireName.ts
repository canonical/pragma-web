import { OPERATOR_DELIMITER, RESERVED_QUERY_KEYS } from "./constants.js";

/**
 * Why a field name cannot be spelled on the wire, or null when it can.
 *
 * A field of a nested record is named by its dot path, and the path is one
 * name: the delimiter rule holds for each of its segments, so no segment may
 * carry the operator delimiter, and the reserved-parameter rule holds for the
 * whole path, so `order` is an ordinary field name while `table.order` is the
 * parameter an arrangement is carried in. A segment with no name addresses
 * nothing.
 *
 * The dot itself needs no escaping: it is not the operator delimiter, so a
 * path is written on the wire exactly as it is declared.
 */
export default function rejectWireName(field: string): string | null {
  // The whole path, before its segments: a reserved parameter is reserved
  // under the name it is written as.
  if (RESERVED_QUERY_KEYS.includes(field)) {
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

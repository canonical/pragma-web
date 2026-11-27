import { ARRANGEMENT_QUERY_PATTERN, RESERVED_QUERY_KEYS } from "./constants.js";

/**
 * Whether a parameter name is the grammar's own: a reserved name, or a
 * table's order or hidden parameter.
 */
export default function isReservedKey(key: string): boolean {
  return (
    RESERVED_QUERY_KEYS.includes(key) || ARRANGEMENT_QUERY_PATTERN.test(key)
  );
}

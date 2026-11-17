import type { PredicateOperator } from "../query/index.js";
import { OPERATOR_DELIMITER } from "./constants.js";

/**
 * The wire key a conjunct is written under: the bare field for `isAny`,
 * `field__operator` otherwise, and `field__operator__ordinal` for an
 * `ordinal` from 1.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function spellWireKey(
  field: string,
  operator: PredicateOperator,
  ordinal = 0,
): string {
  if (ordinal > 0) {
    return `${field}${OPERATOR_DELIMITER}${operator}${OPERATOR_DELIMITER}${ordinal}`;
  }
  return operator === "isAny"
    ? field
    : `${field}${OPERATOR_DELIMITER}${operator}`;
}

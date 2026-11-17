import { OPERATOR_ARITY, type Predicate } from "../query/index.js";
import spellOperand from "./spellOperand.js";

/** The presence marker of the zero-value operator. */
const IS_SET_VALUE = "1";

/**
 * The values one conjunct's key repeats on the wire, in its operands'
 * order: the presence marker for `isSet`, a set's options by their own
 * string form, as an option is matched, and a bound or a text in the plain
 * form the input grammar reads. What a hidden form control carrying the
 * conjunct holds. Pure.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function spellWireValues(
  predicate: Predicate,
): readonly string[] {
  if (predicate.operator === "isSet") {
    return [IS_SET_VALUE];
  }
  return OPERATOR_ARITY[predicate.operator] === "many"
    ? predicate.operands.map(String)
    : predicate.operands.map(spellOperand);
}

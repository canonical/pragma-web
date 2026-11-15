import type { Predicate, PredicateCondition } from "./types.js";

/**
 * The condition a predicate asserts about a record, read from its operator:
 * `isAny` and `is` include; `isNone`, `isNot` and `notContains` exclude;
 * `contains`, `startsWith` and `endsWith` match; `gte` and `lte` bound a
 * range. `isSet` reads its operand: `false` excludes, and `true`, or no
 * operand at all, asserts presence. An operator outside the grammar
 * throws. Pure.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function readCondition(
  predicate: Predicate,
): PredicateCondition {
  switch (predicate.operator) {
    case "isAny":
    case "is":
      return "inclusion";
    case "isNone":
    case "isNot":
    case "notContains":
      return "exclusion";
    case "contains":
    case "startsWith":
    case "endsWith":
      return "match";
    case "gte":
    case "lte":
      return "range";
    case "isSet":
      return predicate.operands.at(0) === false ? "exclusion" : "presence";
    default:
      // An operator added to the type without a condition fails to compile
      // here; one from outside the grammar fails at run time.
      throw new Error(
        `unknown predicate operator ${String(predicate.operator satisfies never)}`,
      );
  }
}

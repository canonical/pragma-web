import type { PredicateOperator } from "@canonical/dataviews-core";
import { OPERATOR_SYMBOLS } from "./constants.js";
import type { TypedSymbolReading } from "./types.js";

/**
 * The operator a typed symbol reads as on one field: the first of the
 * operators the field offers, in their order, that the symbol is typed
 * for, and whether the symbol is widened — `>` reads as `gte` and `<` as
 * `lte`, which the bar announces. A symbol is shared only across kinds, so
 * the field's offer settles which operator `:` or `!=` means. Null when
 * the field offers no operator the symbol is typed for. Pure.
 */
export default function resolveTypedSymbol(
  symbol: string,
  offered: readonly PredicateOperator[],
): TypedSymbolReading | null {
  for (const operator of offered) {
    const typed = OPERATOR_SYMBOLS[operator].find(
      (candidate) => candidate.symbol === symbol,
    );
    if (typed !== undefined) {
      return { operator, widened: typed.widened };
    }
  }
  return null;
}

import type { PredicateOperator } from "@canonical/dataviews-core";
import type { TypedSymbol } from "./types.js";

/** Make a symbol read exactly as it says. */
const createExactSymbol = (symbol: string): TypedSymbol => ({
  symbol,
  widened: false,
});

/** Make a symbol read as the bound it stops short of: `>` as at least. */
const createWidenedSymbol = (symbol: string): TypedSymbol => ({
  symbol,
  widened: true,
});

/**
 * The symbols a reader may type for each operator: the one table the bar
 * reads them through. Keyed by operator, so an operator added to the
 * grammar fails to compile until it is given its symbols. Operators
 * spelled only in words have none.
 */
export const OPERATOR_SYMBOLS: Readonly<
  Record<PredicateOperator, readonly TypedSymbol[]>
> = Object.freeze({
  isAny: [createExactSymbol(":")],
  is: [createExactSymbol(":")],
  isNone: [createExactSymbol("!=")],
  isNot: [createExactSymbol("!=")],
  gte: [createExactSymbol(">="), createWidenedSymbol(">")],
  lte: [createExactSymbol("<="), createWidenedSymbol("<")],
  isSet: [],
  contains: [],
  notContains: [],
  startsWith: [],
  endsWith: [],
});

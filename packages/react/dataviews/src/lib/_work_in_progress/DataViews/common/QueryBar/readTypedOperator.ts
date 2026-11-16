import type { PredicateOperator } from "@canonical/dataviews-core";
import { OPERATOR_SYMBOLS } from "./constants.js";
import resolveTypedSymbol from "./resolveTypedSymbol.js";

/**
 * The operator a typed symbol settles in an operator's Entry, and what
 * was typed after it, which starts the value: `>64` reads as `gte`,
 * widened, then `64`. A symbol another offered one continues, as `>`
 * before `>=`, waits for the next character. Null while no symbol is
 * typed. Pure.
 *
 * @param typed - What is typed in the operator's Entry.
 * @param offered - The operators offered on the field, in order.
 * @returns The operator, whether it is widened, and the rest, or null.
 */
export default function readTypedOperator(
  typed: string,
  offered: readonly PredicateOperator[],
): {
  readonly operator: PredicateOperator;
  readonly widened: boolean;
  readonly rest: string;
} | null {
  const symbols = offered.flatMap((operator) =>
    OPERATOR_SYMBOLS[operator].map(({ symbol }) => symbol),
  );
  // The longest symbol typed, so `>=` is read before `>`.
  const typedSymbol = symbols
    .filter((symbol) => typed.startsWith(symbol))
    .sort((a, b) => b.length - a.length)
    .at(0);
  if (typedSymbol === undefined) return null;
  const isContinued =
    typed === typedSymbol &&
    symbols.some(
      (symbol) => symbol.length > typed.length && symbol.startsWith(typed),
    );
  const reading = resolveTypedSymbol(typedSymbol, offered);
  /* v8 ignore next -- unreachable: the symbol is one an offered operator is typed with */
  if (reading === null || isContinued) return null;
  return { ...reading, rest: typed.slice(typedSymbol.length).trimStart() };
}

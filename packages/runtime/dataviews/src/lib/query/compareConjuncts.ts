import type { Predicate, PredicateOperand } from "./types.js";

/** Order two texts by code unit, the order a predicate address sorts in. */
const compareText = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;

/**
 * Order two operands as their ranks do — by type, then by their own text —
 * without spelling a rank: a string is compared as it is, so the common
 * operand costs no new string.
 */
const compareOperands = (a: PredicateOperand, b: PredicateOperand): number => {
  const byType = compareText(typeof a, typeof b);
  if (byType !== 0) {
    return byType;
  }
  return typeof a === "string"
    ? compareText(a, b as string)
    : compareText(String(a), String(b));
};

/**
 * The total order of conjuncts in a canonical slice: by address — the
 * field, then the operator — and then by operands, compared from the left,
 * a shorter list first where one is the start of the other. Zero only for
 * conjuncts the query cannot tell apart once their operands are
 * canonical, which is how a canonical slice collapses `A AND A` to `A`.
 * Pure.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function compareConjuncts(a: Predicate, b: Predicate): number {
  const byAddress =
    compareText(a.field, b.field) || compareText(a.operator, b.operator);
  if (byAddress !== 0) {
    return byAddress;
  }
  const shorter = Math.min(a.operands.length, b.operands.length);
  for (let at = 0; at < shorter; at += 1) {
    const byOperand = compareOperands(
      // Both lists hold this place: the loop stops at the shorter one.
      a.operands.at(at) as PredicateOperand,
      b.operands.at(at) as PredicateOperand,
    );
    if (byOperand !== 0) {
      return byOperand;
    }
  }
  return a.operands.length - b.operands.length;
}

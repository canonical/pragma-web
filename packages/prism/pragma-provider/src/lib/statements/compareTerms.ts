import type { Term } from "@canonical/ke";
import { compareCodePoints } from "./compareCodePoints.js";

/** A term's rank and key: literals by lexical form, then IRIs, then blank
 * nodes, which keep their order. */
const rankTerm = (term: Term): readonly [number, string] =>
  term.termType === "Literal"
    ? [0, term.value]
    : term.termType === "NamedNode"
      ? [1, term.value]
      : [2, ""];

/**
 * Compare two values as a group orders them: literals by lexical form, then
 * IRIs, in code-point order, then blank nodes in the order they came. Pure.
 */
export const compareTerms = (a: Term, b: Term): number => {
  const [rankA, keyA] = rankTerm(a);
  const [rankB, keyB] = rankTerm(b);
  return rankA === rankB ? compareCodePoints(keyA, keyB) : rankA - rankB;
};

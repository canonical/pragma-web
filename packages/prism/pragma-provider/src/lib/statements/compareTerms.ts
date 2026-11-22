import type { Term } from "@canonical/ke";
import { compareCodePoints } from "@canonical/prism-contract";
import type { BlankStatements } from "./types.js";
import { writeSignature } from "./writeSignature.js";

/**
 * Compare two values as a group orders them: literals by lexical form, then
 * IRIs, in code-point order, then blank nodes by their statements' signature,
 * the order a `path` index counts in. Pure.
 *
 * @param blanks - The statements of the blank nodes the values may name.
 */
export const compareTerms =
  (blanks: BlankStatements) =>
  (a: Term, b: Term): number => {
    const rankTerm = (term: Term): readonly [number, string] =>
      term.termType === "Literal"
        ? [0, term.value]
        : term.termType === "NamedNode"
          ? [1, term.value]
          : [2, writeSignature(term.value, blanks)];
    const [rankA, keyA] = rankTerm(a);
    const [rankB, keyB] = rankTerm(b);
    return rankA === rankB ? compareCodePoints(keyA, keyB) : rankA - rankB;
  };

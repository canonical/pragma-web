import { RDF_TYPE } from "../source/index.js";
import { compareCodePoints } from "./compareCodePoints.js";

/**
 * A comparator ordering predicates as `statements` serves its groups:
 * `rdf:type` first, then by compact form in code-point order. Pure.
 *
 * @param compact - The compact form a predicate sorts by.
 * @returns The comparator, over absolute IRIs.
 */
export const comparePredicates =
  (compact: (uri: string) => string) =>
  (a: string, b: string): number => {
    if (a === RDF_TYPE || b === RDF_TYPE) {
      return a === b ? 0 : a === RDF_TYPE ? -1 : 1;
    }
    return compareCodePoints(compact(a), compact(b));
  };

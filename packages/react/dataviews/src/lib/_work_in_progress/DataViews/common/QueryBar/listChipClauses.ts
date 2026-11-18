import readClauses from "./readClauses.js";
import type {
  QueryPredicateClause,
  QuerySearchClause,
  QueryStateStandIn,
} from "./types.js";

/**
 * The clauses the bar shows as chips, in order: one per conjunct, a
 * range's two bounds each as its own, then the search. A refused
 * parameter has no chip here. Pure.
 *
 * @param state - The query state.
 * @returns The chips' clauses.
 */
export default function listChipClauses(
  state: QueryStateStandIn,
): readonly (QueryPredicateClause | QuerySearchClause)[] {
  return readClauses(state).flatMap(
    (clause): (QueryPredicateClause | QuerySearchClause)[] => {
      if (clause.kind === "refused") return [];
      if (clause.kind !== "range") return [clause];
      const [lowerRef, upperRef] = clause.refs;
      return [
        {
          kind: "predicate",
          id: `${lowerRef.field}__gte__${lowerRef.nth}`,
          refs: [lowerRef],
          predicate: clause.lower,
          condition: "range",
        },
        {
          kind: "predicate",
          id: `${upperRef.field}__lte__${upperRef.nth}`,
          refs: [upperRef],
          predicate: clause.upper,
          condition: "range",
        },
      ];
    },
  );
}

import readClauses from "./readClauses.js";
import type { QueryChipClause, QueryStateStandIn } from "./types.js";

/**
 * The clauses the bar shows as chips, in order: one per conjunct, a
 * field's two bounds as one range, then the search. A refused parameter
 * has no chip here. Pure.
 *
 * @param state - The query state.
 * @returns The chips' clauses.
 */
export default function listChipClauses(
  state: QueryStateStandIn,
): readonly QueryChipClause[] {
  return readClauses(state).filter(
    (clause): clause is QueryChipClause => clause.kind !== "refused",
  );
}

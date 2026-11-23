import { isNarrowingIssue } from "@canonical/dataviews-core/bindings";
import readClauses from "./readClauses.js";
import type { QueryClause, QueryStateStandIn } from "./types.js";

/**
 * The clauses the bar shows as chips, in order: one per conjunct, a
 * field's two bounds as one range, the search, then each refused filter
 * or search a link carried. A refused parameter that narrows nothing,
 * such as a sort, has no chip here. Pure.
 *
 * @param state - The query state.
 * @returns The chips' clauses.
 */
export default function listChipClauses(
  state: QueryStateStandIn,
): readonly QueryClause[] {
  return readClauses(state).filter(
    (clause) => clause.kind !== "refused" || isNarrowingIssue(clause.issue),
  );
}

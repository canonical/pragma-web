import { readCondition } from "@canonical/dataviews-core";
import placeConjuncts from "./placeConjuncts.js";
import type {
  QueryClause,
  QueryPredicateClause,
  QueryRefusedClause,
  QueryStateStandIn,
} from "./types.js";

/** Each conjunct of the filter as its own clause, in canonical order. */
const readPredicateClauses = (
  state: QueryStateStandIn,
): QueryPredicateClause[] =>
  placeConjuncts(state.slice).map(({ predicate, ref }) => ({
    kind: "predicate",
    id: `${ref.field}__${ref.operator}__${ref.nth}`,
    refs: [ref],
    predicate,
    condition: readCondition(predicate),
  }));

/** Each refused parameter as its own clause, a repeated one numbered. */
const readRefusedClauses = (state: QueryStateStandIn): QueryRefusedClause[] => {
  const counts = new Map<string, number>();
  return state.refused.map((issue) => {
    const k = counts.get(issue.parameter) ?? 0;
    counts.set(issue.parameter, k + 1);
    const id = `refused__${issue.parameter}`;
    return {
      kind: "refused",
      id: k === 0 ? id : `${id}__${k}`,
      refs: [],
      issue,
    };
  });
};

/**
 * The query state as the chips a bar shows, in order: one per conjunct of
 * the filter, in canonical order; the search, when there is one; then one
 * per refused parameter. Each carries the conjuncts it stands for and a
 * stable id. Derived on every read and never stored. Pure.
 */
export default function readClauses(
  state: QueryStateStandIn,
): readonly QueryClause[] {
  const search = state.slice.search;
  return [
    ...readPredicateClauses(state),
    ...(search === null || search === ""
      ? []
      : [{ kind: "search", id: "search", refs: [], search } as const]),
    ...readRefusedClauses(state),
  ];
}

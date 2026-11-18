import { readCondition, type Slice } from "@canonical/dataviews-core";
import compareBounds from "./compareBounds.js";
import placeConjuncts from "./placeConjuncts.js";
import type {
  QueryClause,
  QueryPredicateClause,
  QueryRangeClause,
  QueryRefusedClause,
  QueryStateStandIn,
} from "./types.js";

/** One field's bound clauses, by operator. */
type Bounds = {
  readonly gte: QueryPredicateClause[];
  readonly lte: QueryPredicateClause[];
};

/**
 * The range each field's bounds read as, keyed by field: where it holds
 * exactly one `gte` and one `lte` conjunct, the lower at or below the
 * upper.
 */
const listRanges = (
  clauses: readonly QueryPredicateClause[],
): ReadonlyMap<string, QueryRangeClause> => {
  const bounds = new Map<string, Bounds>();
  for (const clause of clauses) {
    const { field, operator } = clause.predicate;
    if (operator === "gte" || operator === "lte") {
      const held = bounds.get(field) ?? { gte: [], lte: [] };
      held[operator].push(clause);
      bounds.set(field, held);
    }
  }
  const ranges = new Map<string, QueryRangeClause>();
  for (const [field, { gte, lte }] of bounds) {
    const [lower, ...lowers] = gte;
    const [upper, ...uppers] = lte;
    if (
      lower === undefined ||
      upper === undefined ||
      lowers.length > 0 ||
      uppers.length > 0
    ) {
      continue;
    }
    const order = compareBounds(
      lower.predicate.operands.at(0),
      upper.predicate.operands.at(0),
    );
    if (order !== null && order <= 0) {
      ranges.set(field, {
        kind: "range",
        id: `${field}__range`,
        field,
        refs: [lower.refs[0], upper.refs[0]],
        lower: lower.predicate,
        upper: upper.predicate,
        condition: "range",
      });
    }
  }
  return ranges;
};

/**
 * Each range's two bound clauses as the one range clause, standing where
 * its lower bound stood; every other clause as it was.
 */
const groupRanges = (
  clauses: readonly QueryPredicateClause[],
): readonly (QueryPredicateClause | QueryRangeClause)[] => {
  const ranges = listRanges(clauses);
  if (ranges.size === 0) {
    return clauses;
  }
  return clauses.flatMap(
    (clause): (QueryPredicateClause | QueryRangeClause)[] => {
      const { field, operator } = clause.predicate;
      const range = ranges.get(field);
      if (range === undefined) {
        return [clause];
      }
      // The range stands in its lower bound's place, and its upper bound's
      // is left empty; any other conjunct on the field stays as it was.
      if (operator === "gte") {
        return [range];
      }
      return operator === "lte" ? [] : [clause];
    },
  );
};

/** Each conjunct of the filter as its own clause, in canonical order. */
const readPredicateClauses = (slice: Slice): QueryPredicateClause[] =>
  placeConjuncts(slice).map(({ predicate, ref }) => ({
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
 * the filter, in canonical order, except that a field holding exactly one
 * `gte` and one `lte`, the lower at or below the upper, reads as one range
 * where its lower bound stands; the search, when there is one; then one
 * per refused parameter. Each carries the conjuncts it stands for and a
 * stable id. Derived on every read and never stored. Pure.
 */
export default function readClauses(
  state: QueryStateStandIn,
): readonly QueryClause[] {
  const search = state.slice.search;
  return [
    ...groupRanges(readPredicateClauses(state.slice)),
    ...(search === null || search === ""
      ? []
      : [{ kind: "search", id: "search", refs: [], search } as const]),
    ...readRefusedClauses(state),
  ];
}

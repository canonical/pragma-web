import { arePredicatesEqual, type Slice } from "../query/index.js";
import type { QueryIssue } from "../result/index.js";

/** Whether two slices hold the same predicates on one field. */
const isFieldUnchanged = (field: string, from: Slice, to: Slice): boolean => {
  const before = from.filter.filter((predicate) => predicate.field === field);
  const after = to.filter.filter((predicate) => predicate.field === field);
  return (
    before.length === after.length &&
    before.every((predicate) =>
      after.some((other) => arePredicatesEqual(predicate, other)),
    )
  );
};

/**
 * The withheld clauses a destination still carries: those whose clause it
 * leaves as it is. A destination that changes a field's predicates — or the
 * search, for a refused search — replaces that refused clause, as the
 * command leading there would, so the clause is not carried into it.
 */
export default function listCarriedIssues(
  withheld: readonly QueryIssue[],
  from: Slice,
  to: Slice,
): readonly QueryIssue[] {
  return withheld.filter((issue) =>
    issue.field === null
      ? from.search === to.search
      : isFieldUnchanged(issue.field, from, to),
  );
}

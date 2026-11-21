import { RDF_TYPE_URI } from "./constants.js";
import type {
  RecordStatement,
  RecordStatementGroup,
  RecordTerm,
} from "./types.js";

/** A term's sort key and rank: literals by lexical form, then IRIs. */
const rankTerm = (term: RecordTerm): readonly [number, string] =>
  term.kind === "literal"
    ? [0, term.lexical]
    : term.kind === "node"
      ? [1, term.uri]
      : [2, ""];

/** Compare two terms: literals by lexical form, then nodes by IRI, then
 * nested values in their own order. */
const compareTerms = (a: RecordTerm, b: RecordTerm): number => {
  const [rankA, keyA] = rankTerm(a);
  const [rankB, keyB] = rankTerm(b);
  if (rankA !== rankB) return rankA - rankB;
  return keyA === keyB ? 0 : keyA < keyB ? -1 : 1;
};

/**
 * Group statements by predicate, as `statements` serves them: `rdf:type`
 * first, then the predicates by compact form in code-point order; each
 * group's values sorted (literals by lexical form, then nodes by IRI, then
 * nested values in their own order) and cut to `perPredicate`, its `total`
 * the count before the cut. Pure.
 *
 * @param statements - One subject's statements in one direction.
 * @param perPredicate - The most values a group keeps.
 * @param compact - The compact form a predicate sorts by.
 * @returns The groups, in order.
 */
export default function groupRecordStatements(
  statements: readonly RecordStatement[],
  perPredicate: number,
  compact: (uri: string) => string,
): readonly RecordStatementGroup[] {
  const byPredicate = statements.reduce(
    (groups, statement) =>
      groups.set(statement.predicate, [
        ...(groups.get(statement.predicate) ?? []),
        statement,
      ]),
    new Map<string, readonly RecordStatement[]>(),
  );
  return [...byPredicate]
    .toSorted(([a], [b]) => {
      if (a === RDF_TYPE_URI || b === RDF_TYPE_URI) {
        return a === b ? 0 : a === RDF_TYPE_URI ? -1 : 1;
      }
      const [keyA, keyB] = [compact(a), compact(b)];
      return keyA === keyB ? 0 : keyA < keyB ? -1 : 1;
    })
    .map(([predicate, group]) => ({
      predicate,
      total: group.length,
      values: group
        .map(({ object }) => object)
        .toSorted(compareTerms)
        .slice(0, perPredicate),
    }));
}

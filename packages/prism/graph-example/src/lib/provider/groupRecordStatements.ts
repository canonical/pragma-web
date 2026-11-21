import compareCodePoints from "./compareCodePoints.js";
import { RDF_TYPE_URI } from "./constants.js";
import type {
  RankedKey,
  RecordStatement,
  RecordStatementGroup,
  RecordTerm,
} from "./types.js";

/** Compare two ranked keys: by rank, then by key in code-point order. */
const compareRankedKeys = (
  [rankA, keyA]: RankedKey,
  [rankB, keyB]: RankedKey,
): number => rankA - rankB || compareCodePoints(keyA, keyB);

/** A term's rank and key: literals by lexical form, then IRIs, then nested
 * values, which keep their own order. */
const rankTerm = (term: RecordTerm): RankedKey =>
  term.kind === "literal"
    ? [0, term.lexical]
    : term.kind === "node"
      ? [1, term.uri]
      : [2, ""];

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
  const rankPredicate = (uri: string): RankedKey =>
    uri === RDF_TYPE_URI ? [0, ""] : [1, compact(uri)];
  const byPredicate = statements.reduce(
    (groups, statement) =>
      groups.set(statement.predicate, [
        ...(groups.get(statement.predicate) ?? []),
        statement,
      ]),
    new Map<string, readonly RecordStatement[]>(),
  );
  return [...byPredicate]
    .toSorted(([a], [b]) =>
      compareRankedKeys(rankPredicate(a), rankPredicate(b)),
    )
    .map(([predicate, group]) => ({
      predicate,
      total: group.length,
      values: group
        .map(({ object }) => object)
        .toSorted((a, b) => compareRankedKeys(rankTerm(a), rankTerm(b)))
        .slice(0, perPredicate),
    }));
}

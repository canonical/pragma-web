import { comparePredicates } from "./comparePredicates.js";
import { compareTerms } from "./compareTerms.js";
import type {
  BlankStatements,
  StatementGroupSource,
  TermStatement,
} from "./types.js";

/**
 * Group statements already read by predicate, as `statements` serves them:
 * in the order `comparePredicates` gives, each group's values sorted by
 * `compareTerms` and cut to `perPredicate`, its total the count before the
 * cut. Pure.
 *
 * @param statements - One subject's statements in one direction.
 * @param perPredicate - The most values a group keeps.
 * @param depth - How deep the groups sit: 1 for the entity's own.
 * @param blanks - The statements of the blank nodes the values may name.
 * @param compact - The compact form a predicate sorts and a foreign IRI
 * is written by.
 * @returns The groups, in order.
 */
export const groupTermStatements = (
  statements: readonly TermStatement[],
  perPredicate: number,
  depth: number,
  blanks: BlankStatements,
  compact: (uri: string) => string,
): readonly StatementGroupSource[] => {
  const byPredicate = statements.reduce(
    (groups, { predicate, term }) =>
      groups.set(predicate, [...(groups.get(predicate) ?? []), term]),
    new Map<string, StatementGroupSource["terms"]>(),
  );
  return [...byPredicate]
    .toSorted(([a], [b]) => comparePredicates(compact)(a, b))
    .map(([predicate, terms]) => ({
      predicate,
      total: terms.length,
      terms: terms.toSorted(compareTerms(blanks)).slice(0, perPredicate),
      depth,
      blanks,
      compact,
    }));
};

import type { BlankStatements } from "./types.js";

/**
 * A blank node's statements as one text, which orders blank nodes that
 * carry no key of their own the same on every read: a group lists its
 * blank values in this order and a `path` index counts in it. Pure.
 *
 * @param label - The blank node's label in the store.
 * @param blanks - The statements of the blank nodes, by label.
 */
export const writeSignature = (
  label: string,
  blanks: BlankStatements,
): string =>
  (blanks.get(label) ?? [])
    .map(({ predicate, term }) => `${predicate} ${term.value}`)
    .toSorted()
    .join("\n");

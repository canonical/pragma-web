/**
 * The statements extension's constants: the patterns its queries read an
 * entity's statements through, by direction, and the order of a group's
 * values.
 */

import type { StatementDirection } from "./types.js";

/**
 * The SPARQL rank a value sorts by before its text: literals, then IRIs,
 * then blank nodes, as the contract orders a group's values.
 */
export const VALUE_RANK = "IF(isLiteral(?v), 0, IF(isIRI(?v), 1, 2))";

/**
 * The triple pattern that binds `?v` to the other side of a statement with
 * predicate `predicate` about `uri`, by direction.
 */
export const STATEMENT_PATTERNS: Readonly<
  Record<StatementDirection, (uri: string, predicate: string) => string>
> = {
  OUT: (uri, predicate) => `<${uri}> ${predicate} ?v`,
  IN: (uri, predicate) => `?v ${predicate} <${uri}>`,
};

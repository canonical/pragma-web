import { STATEMENT_PATTERNS, VALUE_RANK } from "./constants.js";
import type { StatementDirection } from "./types.js";

/**
 * The query counting `uri`'s statements per predicate in one direction.
 *
 * @param uri - An absolute IRI already checked safe to send.
 */
export const buildCountQuery = (
  uri: string,
  direction: StatementDirection,
): string =>
  `SELECT ?p (COUNT(?v) AS ?n) WHERE { ${STATEMENT_PATTERNS[direction](uri, "?p")} } GROUP BY ?p`;

/** The query for the first `limit` values of one predicate's group. */
export const buildWindowQuery = (
  uri: string,
  direction: StatementDirection,
  predicate: string,
  limit: number,
): string =>
  `SELECT ?v WHERE { ${STATEMENT_PATTERNS[direction](uri, `<${predicate}>`)} } ORDER BY (${VALUE_RANK}) STR(?v) LIMIT ${limit}`;

/** The query for the statements of every blank node on the other side. */
export const buildBlankQuery = (
  uri: string,
  direction: StatementDirection,
): string =>
  `SELECT ?v ?p ?o WHERE { ${STATEMENT_PATTERNS[direction](uri, "?q")} FILTER(isBlank(?v)) ?v ?p ?o }`;

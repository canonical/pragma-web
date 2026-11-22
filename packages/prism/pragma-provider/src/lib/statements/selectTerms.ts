import type { TermBinding } from "@canonical/ke";
import type { QueryFn } from "@canonical/ke-graphql";

/**
 * Run a SELECT query and return its rows with their terms kept.
 *
 * @param query - Runs SPARQL against the store.
 * @param sparql - A SELECT query.
 * @returns The rows, each a term by variable name.
 * @throws When the store answers with anything but a SELECT result.
 * @note Impure: queries the store.
 */
export const selectTerms = async (
  query: QueryFn,
  sparql: string,
): Promise<readonly TermBinding[]> => {
  const result = await query(sparql);
  if (result.type !== "select") {
    throw new Error(
      `expected a SELECT result for statements, got ${result.type}`,
    );
  }
  return result.termBindings;
};

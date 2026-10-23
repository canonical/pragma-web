import type { QueryFn } from "@canonical/ke-graphql";
import { TYPED_SUBJECTS_QUERY } from "./constants.js";

/**
 * Every IRI the graph gives an `rdf:type`, in the order the store returns
 * them.
 *
 * @param query - Runs SPARQL against the store.
 * @returns The typed IRI subjects, each once.
 * @throws When the store answers with anything but a SELECT result.
 * @note Impure: queries the store.
 */
export const selectTypedSubjects = async (
  query: QueryFn,
): Promise<readonly string[]> => {
  const result = await query(TYPED_SUBJECTS_QUERY);
  if (result.type !== "select") {
    throw new Error(
      `expected a SELECT result for the typed subjects, got ${result.type}`,
    );
  }
  return result.termBindings.map((row) => row.s.value);
};

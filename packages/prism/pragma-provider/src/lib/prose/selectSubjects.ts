import { isSafeIri, type QueryFn } from "@canonical/ke-graphql";

/**
 * The IRIs among `iris` that are the subject of at least one triple.
 *
 * One query for the whole list. An IRI that could not sit inside a SPARQL
 * IRI reference (`isSafeIri`) is left out of the query, and so out of the
 * result; an empty list asks nothing.
 *
 * @param query - Runs SPARQL against the store.
 * @param iris - The IRIs to test.
 * @returns The ones the graph describes.
 * @note Impure: queries the store.
 */
export const selectSubjects = async (
  query: QueryFn,
  iris: readonly string[],
): Promise<ReadonlySet<string>> => {
  const safe = iris.filter((iri) => isSafeIri(iri));
  if (safe.length === 0) return new Set();
  const values = safe.map((iri) => `<${iri}>`).join(" ");
  const result = await query(
    `SELECT DISTINCT ?s WHERE { VALUES ?s { ${values} } ?s ?p ?o }`,
  );
  if (result.type !== "select") {
    throw new Error(
      `expected a SELECT result for the prose subjects, got ${result.type}`,
    );
  }
  return new Set(result.termBindings.map((row) => row.s.value));
};

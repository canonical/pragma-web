import type { QueryFn } from "@canonical/ke-graphql";
import {
  type ClassEdge,
  type TBoxOutline,
  weighClassEdges,
} from "@canonical/prism-contract";
import {
  CLASS_EDGE_DECLARATIONS_QUERY,
  CLASS_EDGE_OBSERVATIONS_QUERY,
} from "./constants.js";

/** One row of a SELECT result: its bound variables' values. */
type Row = Readonly<Record<string, { readonly value: string }>>;

/**
 * Run a SELECT query and return its rows.
 *
 * @throws When the store answers with anything but a SELECT result.
 * @note Impure: queries the store.
 */
const selectRows = async (
  query: QueryFn,
  sparql: string,
): Promise<readonly Row[]> => {
  const result = await query(sparql);
  if (result.type !== "select") {
    throw new Error(
      `expected a SELECT result for the class edges, got ${result.type}`,
    );
  }
  return result.termBindings as readonly Row[];
};

/**
 * Weigh the edges between the store's classes: each object property's
 * declared domain and range with the statements it covers, and each class
 * pair the store links that no declaration covers.
 *
 * @param query - Runs SPARQL against the store.
 * @param outline - The class hierarchy subclass coverage is read from.
 * @returns The edges, sorted by property, subject class and object class.
 * @note Impure: queries the store twice.
 */
export const countClassEdges = async (
  query: QueryFn,
  outline: TBoxOutline,
): Promise<readonly ClassEdge[]> => {
  const declarations = (
    await selectRows(query, CLASS_EDGE_DECLARATIONS_QUERY)
  ).map((row) => ({
    property: row.property.value,
    domain: row.domain.value,
    range: row.range.value,
  }));
  const observations = (
    await selectRows(query, CLASS_EDGE_OBSERVATIONS_QUERY)
  ).map((row) => ({
    property: row.property.value,
    subjectClass: row.subjectClass.value,
    objectClass: row.objectClass.value,
    count: Number(row.count.value),
  }));
  return weighClassEdges(declarations, observations, outline);
};

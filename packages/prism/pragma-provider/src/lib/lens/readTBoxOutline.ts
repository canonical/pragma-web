import type { QueryFn } from "@canonical/ke-graphql";
import type { LangLiterals, TBoxOutline } from "@canonical/prism-contract";
import {
  OUTLINE_CLASSES_QUERY,
  OUTLINE_PROPERTIES_QUERY,
} from "./constants.js";

/** One row of a SELECT result: its bound variables' terms. */
type Row = Readonly<
  Record<string, { readonly value: string; readonly language?: string }>
>;

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
      `expected a SELECT result for the TBox outline, got ${result.type}`,
    );
  }
  return result.termBindings as readonly Row[];
};

/** Add `value` to the set `key` names in `map`, creating the set. */
const collect = <T>(map: Map<string, Set<T>>, key: string, value?: T) => {
  const set = map.get(key) ?? new Set<T>();
  if (value !== undefined) set.add(value);
  map.set(key, set);
};

/**
 * Read the outline of the store's TBox the site lens is resolved against:
 * each class with its direct superclasses, and each property with its
 * declared inverse (`owl:inverseOf`, read both ways) and its asserted labels
 * keyed by language tag ("" for an untagged one).
 *
 * @param query - Runs SPARQL against the store.
 * @returns The outline, classes and properties in the order the store lists them.
 * @note Impure: queries the store twice.
 */
export const readTBoxOutline = async (query: QueryFn): Promise<TBoxOutline> => {
  const parents = new Map<string, Set<string>>();
  for (const row of await selectRows(query, OUTLINE_CLASSES_QUERY)) {
    collect(parents, row.class.value, row.parent?.value);
  }
  const inverses = new Map<string, Set<string>>();
  const labels = new Map<string, Record<string, string>>();
  for (const row of await selectRows(query, OUTLINE_PROPERTIES_QUERY)) {
    const uri = row.property.value;
    collect(inverses, uri, row.inverse?.value);
    const literals = labels.get(uri) ?? {};
    if (row.label !== undefined) {
      literals[row.label.language ?? ""] ??= row.label.value;
    }
    labels.set(uri, literals);
  }
  return {
    classes: [...parents].map(([uri, set]) => ({ uri, parents: [...set] })),
    properties: [...inverses].map(([uri, set]) => ({
      uri,
      inverse: [...set].at(0),
      labels: labels.get(uri) as LangLiterals,
    })),
  };
};

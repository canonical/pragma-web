import { executeLocal, isIncrementalResults } from "@canonical/ke-graphql";
import { type DocumentNode, parse } from "graphql";
import { SEARCH_ENTRY_QUERY } from "./constants.js";
import { selectTypedSubjects } from "./selectTypedSubjects.js";
import type { SearchEntry, SearchIndex, SearchIndexSources } from "./types.js";

/** What `SEARCH_ENTRY_QUERY` selects of one node. */
interface SearchEntryNode {
  readonly uri: string;
  readonly _meta: Omit<SearchEntry, "uri">;
}

/**
 * Read one candidate through the schema's `node(id:)`.
 *
 * @returns Its entry, or undefined when `node(id:)` resolves it to null.
 * @throws Naming the IRI, when the query reports an error.
 * @note Impure: executes a query, which reads the store.
 */
const readSearchEntry = async (
  { schema, context }: SearchIndexSources,
  document: DocumentNode,
  id: string,
): Promise<SearchEntry | undefined> => {
  const result = await executeLocal({
    schema,
    source: SEARCH_ENTRY_QUERY,
    document,
    variableValues: { id },
    contextValue: context,
  });
  /* v8 ignore next 3 -- executeLocal returns a stream only for a document
     using @defer or @stream, and SEARCH_ENTRY_QUERY uses neither. */
  if (isIncrementalResults(result)) {
    throw new Error("search index: expected a single result, got a stream");
  }
  const error = result.errors?.at(0);
  if (error !== undefined) {
    throw new Error(`search index: node(id: "${id}") failed: ${error.message}`);
  }
  const { node } = result.data as { node: SearchEntryNode | null };
  return node === null ? undefined : { uri: node.uri, ...node._meta };
};

/**
 * Build the search index: every IRI the graph types, read through the
 * compiled schema's own `node(id:)`, so an entry holds exactly what `_meta`
 * serves. IRIs `node(id:)` resolves to null, properties and ontologies
 * among them, are left out.
 *
 * The reads run concurrently over the one context, so its loaders batch
 * them.
 *
 * @param sources - The schema, a context for it, and the store's query
 * function.
 * @returns The index, in the order the store listed the IRIs.
 * @throws Naming the IRI, when reading one fails.
 * @note Impure: queries the store and executes one query per typed subject.
 */
export const indexSearch = async (
  sources: SearchIndexSources,
): Promise<SearchIndex> => {
  const document = parse(SEARCH_ENTRY_QUERY);
  const iris = await selectTypedSubjects(sources.query);
  const entries = await Promise.all(
    iris.map((id) => readSearchEntry(sources, document, id)),
  );
  return entries.filter((entry) => entry !== undefined);
};

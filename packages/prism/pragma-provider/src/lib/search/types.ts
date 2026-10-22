/**
 * The types the search domain shares between its modules.
 */

import type { CompilerContext, QueryFn } from "@canonical/ke-graphql";
import type { GraphQLSchema } from "graphql";

/** One node as the search index holds it: what text search matches against. */
export interface SearchEntry {
  /** The node's absolute IRI. */
  readonly uri: string;
  /** `_meta.title` in the default language. */
  readonly title: string;
  /** `_meta.curie`. */
  readonly curie: string;
  /** `_meta.definition` in the default language, or null when it has none. */
  readonly definition: string | null;
}

/** Every node `node(id:)` resolves, as search entries, in no set order. */
export type SearchIndex = readonly SearchEntry[];

/** How one entry matches a search: which field, and where in it. */
export interface SearchMatch {
  /** The entry's absolute IRI. */
  readonly uri: string;
  /** The field that matched, as its place in `SEARCH_FIELDS`. */
  readonly tier: number;
  /** Where in that field the text starts, lowercased. */
  readonly position: number;
  /** The entry's title, which breaks ties between equal matches. */
  readonly title: string;
}

/** What the search index is built from. */
export interface SearchIndexSources {
  /** The compiled schema, whose `node(id:)` reads each entry. */
  readonly schema: GraphQLSchema;
  /** A context for the schema, shared by every read so its loaders batch. */
  readonly context: CompilerContext;
  /** Runs SPARQL against the store, to list the candidates. */
  readonly query: QueryFn;
}

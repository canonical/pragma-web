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
  /**
   * The IRI of the type the entry is counted under: `_meta.type`'s, the
   * most specific class of an instance and owl:Class for a class.
   */
  readonly type: string;
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
  /** The value of the field that matched, as the entry holds it. */
  readonly value: string;
  /** The entry's title, which breaks ties between equal matches. */
  readonly title: string;
  /** The IRI of the type the entry is counted under. */
  readonly type: string;
}

/** A search match's passage and where the text occurs in it. */
export interface SearchPassage {
  /** At most `SEARCH_PASSAGE_LENGTH` code units of the matched value. */
  readonly passage: string;
  /** Every occurrence of the text lying wholly inside the passage. */
  readonly ranges: readonly {
    readonly start: number;
    readonly length: number;
  }[];
}

/** The number of search matches of one type. */
export interface TypeCount {
  /** The type's IRI. */
  readonly type: string;
  /** Its matches. */
  readonly count: number;
}

/** What the search index is built from. */
export interface SearchIndexSources {
  /** The served schema, whose `node(id:)` reads each entry and its class's visibility. */
  readonly schema: GraphQLSchema;
  /** A context for the schema, shared by every read so its loaders batch. */
  readonly context: CompilerContext;
  /** Runs SPARQL against the store, to list the candidates. */
  readonly query: QueryFn;
}

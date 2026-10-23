/**
 * A SPARQL query function over the hermetic corpus, for tests that need the
 * graph without a compiled schema.
 *
 * Test infrastructure: excluded from the build (tsconfig.build.json) and from
 * coverage (vitest.config.ts).
 */

import { createStore } from "@canonical/ke";
import { createStoreQueryFn, type QueryFn } from "@canonical/ke-graphql";
import { cacheRefRoots, collectTtlSources } from "../lib/sources/index.js";
import { CORPUS_REFS_ROOT } from "./corpus.js";

/**
 * Boot a store over the corpus's ref packages and return a query function
 * against it.
 *
 * @note Impure: reads the corpus and boots an Oxigraph WASM store.
 */
export const bootCorpusQuery = async (): Promise<QueryFn> => {
  const sources = collectTtlSources({
    refRoots: cacheRefRoots(CORPUS_REFS_ROOT),
    semRoot: null,
  });
  const store = await createStore({
    sources: sources.map(({ content, path }) => ({ content, path })),
  });
  return createStoreQueryFn(store);
};

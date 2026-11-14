/**
 * The corpus compiled into a schema, with a context and a query function
 * over the same store, for tests that execute against the compiled schema
 * without going through the provider's handler.
 *
 * Test infrastructure: excluded from the build (tsconfig.build.json) and from
 * coverage (vitest.config.ts).
 */

import { createStore, type Plugin } from "@canonical/ke";
import {
  createSchemaPlugin,
  createStoreQueryFn,
  type SchemaPluginApi,
} from "@canonical/ke-graphql";
import { indexSiteLens, type SiteLens } from "@canonical/prism-contract";
import {
  extendWithLens,
  readTBoxOutline,
  SITE_LENS,
} from "../lib/lens/index.js";
import type { SearchIndexSources } from "../lib/search/types.js";
import {
  cacheRefRoots,
  collectTtlSources,
  harvestPrefixes,
} from "../lib/sources/index.js";
import { CORPUS_REFS_ROOT } from "./corpus.js";

/**
 * Boot a store over the corpus's ref packages with the schema plugin,
 * compiled and served with `lens` as the provider serves it, and return the
 * schema, a fresh context and a query function.
 *
 * @note Impure: reads the corpus and boots an Oxigraph WASM store.
 */
export const bootCorpusSchema = async (
  lens: SiteLens = SITE_LENS,
): Promise<SearchIndexSources> => {
  const sources = collectTtlSources(cacheRefRoots(CORPUS_REFS_ROOT));
  // biome-ignore lint/suspicious/noExplicitAny: the Plugin generic is invariant, so the plugin array needs `any` here, as in createPragmaProvider
  const plugins: Plugin<any>[] = [
    createSchemaPlugin({
      incremental: true,
      mode: "annotated",
      prefixing: "none",
    }),
  ];
  const store = await createStore({
    sources: sources.map(({ content, path }) => ({ content, path })),
    prefixes: harvestPrefixes(sources),
    plugins,
  });
  const api = store.api<SchemaPluginApi>("ke-graphql");
  if (api === undefined) {
    throw new Error("ke-graphql plugin did not register its API");
  }
  const query = createStoreQueryFn(store);
  return {
    schema: extendWithLens(
      api.schema,
      indexSiteLens(lens, await readTBoxOutline(query)),
    ),
    context: api.createContext(store),
    query,
  };
};

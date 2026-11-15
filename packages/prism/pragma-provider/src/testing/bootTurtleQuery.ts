/**
 * A SPARQL query function over one Turtle text, for tests whose graph the
 * hermetic corpus does not hold.
 *
 * Test infrastructure: excluded from the build (tsconfig.build.json) and from
 * coverage (vitest.config.ts).
 */

import { createStore } from "@canonical/ke";
import { createStoreQueryFn, type QueryFn } from "@canonical/ke-graphql";

/**
 * Boot a store over `content` and return a query function against it.
 *
 * @note Impure: boots an Oxigraph WASM store.
 */
export const bootTurtleQuery = async (content: string): Promise<QueryFn> =>
  createStoreQueryFn(
    await createStore({ sources: [{ content, path: "test/graph.ttl" }] }),
  );

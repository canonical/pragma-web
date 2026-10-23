/**
 * The pragma provider: TTL corpus → Oxigraph store → executable schema →
 * fetch-native handler.
 *
 * -----------------------------------------------------------------------------
 * IMPLEMENTER DECISION 1 (plan OQ-5): `sdlOutput` is OPTIONAL, and its absence
 * means NO WRITE. It has no default and this package never derives one.
 *
 * The alternative — making it REQUIRED, so omitting it is a type error — is a
 * stronger guard against the specific accident this shape exists to prevent
 * (see below), and it was a close call. It was rejected because it forces
 * `demo/server.ts` to invent an SDL path it does not want, and inventing a
 * path is precisely the failure being designed out: a provider that must name
 * a file has to have an opinion about where the consumer's source tree is.
 * Optional-no-write means the default behaviour of this package is to write
 * nothing, anywhere, ever, which is the safest possible default and the one
 * that needs no reviewer to check it.
 *
 * THE ACCIDENT IT PREVENTS. The app's former `src/server/graphql.ts` derived
 * the path itself:
 *
 *     const SDL_OUTPUT_PATH = fileURLToPath(
 *       new URL("../relay/schema.graphql", import.meta.url),
 *     );
 *
 * Carried into this package unchanged, that resolves relative to THIS file —
 * so the app's schema would be written into `packages/prism/pragma-provider/`
 * (or into `node_modules/`), `tsc --noEmit` would pass, `biome check` would
 * pass, and every test in the repo would pass. Only a boot reveals it, and a
 * boot needs a populated refs cache. The guard is therefore structural, not a
 * test: there is no path in this package to get wrong. The consumer passes one
 * or nothing happens. `createPragmaProvider.test.ts` covers both branches, and
 * the boot log names the resolved path so a live run says which it took.
 *
 * -----------------------------------------------------------------------------
 * IMPLEMENTER DECISION 2 (plan §3, item 6 of its bad-ideas list): the
 * `getGraphqlBackend()` memoising singleton is DROPPED. This is a plain
 * factory.
 *
 * That singleton was a lazy promise cache that forgot a rejected boot so the
 * next request would retry. Its justification was the pre-split world where
 * the backend was mounted INSIDE whichever web server was running and booted
 * on first GraphQL request — retry-on-failure mattered because a request could
 * arrive before the refs cache was ready. Since the PRD-3 process split the
 * only caller is the standalone graph server, which awaits exactly one boot at
 * module top level, before it listens, and exits non-zero if it fails. There is
 * no second call to memoise and no request to retry. Keeping the machinery
 * would mean shipping prose describing a world that no longer exists, which is
 * the thing this despecialization train is mostly about not doing.
 *
 * A caller that genuinely wants one shared instance holds the promise itself —
 * which is one line at the call site.
 *
 * -----------------------------------------------------------------------------
 * `mode` and `prefixing` ARE PASSED EXPLICITLY. The app set neither, so it ran
 * at ke-graphql's defaults by accident. They are pinned here because
 * `prefixing: "none"` is what makes the emitted field names byte-compatible
 * with the committed `schema.graphql` that relay-compiler reads: `prefixing:
 * "all"` would namespace-prefix EVERY field in the schema (the blanket M005
 * remedy) and invalidate every committed Relay artifact at once. An implicit
 * default that a dependency bump could change is exactly the kind of unstated
 * fact this package exists to write down. They are constants, not options,
 * for the same reason `EXCLUDED_SOURCES` is (see config/constants.ts).
 */

import { relative } from "node:path";
import { createStore, type Plugin } from "@canonical/ke";
import {
  createSchemaPlugin,
  createStoreQueryFn,
  type SchemaPluginApi,
} from "@canonical/ke-graphql";
import { createGraphQLHandler } from "@canonical/ke-graphql/http";
import type { PragmaProvider, PragmaProviderOptions } from "../config/index.js";
import {
  bindProseSidecars,
  createProseExtensions,
  readRequestLocale,
} from "../prose/index.js";
import { createSearchExtensions, indexSearch } from "../search/index.js";
import {
  collectProseSidecars,
  collectTtlSources,
  describeRefRoots,
  harvestPrefixes,
  resolveRefRoots,
  resolveSemRoot,
} from "../sources/index.js";
import { composeExtensions } from "./composeExtensions.js";

/** Projection mode, pinned — see this module's header. */
const MODE = "annotated";

/** Field-name prefixing, pinned — see this module's header. */
const PREFIXING = "none";

/** The provider identity stamped into the SDL's provenance header. */
const PROVIDER = "@canonical/prism-pragma-provider";

/**
 * Boot the store, compile the schema, and build the fetch handler.
 *
 * @note Impure — reads the source cache and the prose sidecars beside it,
 * boots an Oxigraph WASM store, queries it once to bind the sidecars,
 * executes one query per typed subject to index search, and writes the
 * emitted SDL **only** when `sdlOutput` is given.
 */
export const createPragmaProvider = async (
  options: PragmaProviderOptions = {},
): Promise<PragmaProvider> => {
  const refRoots = resolveRefRoots(options.refsRoot);
  const sources = collectTtlSources({
    refRoots,
    // `undefined` means "not given", so the environment decides; `null` is
    // the caller saying "the ref packages alone", and is passed through.
    semRoot: options.semRoot === undefined ? resolveSemRoot() : options.semRoot,
  });
  const sidecars = collectProseSidecars(refRoots);
  const prefixes = harvestPrefixes(sources);
  const graphql = createSchemaPlugin({
    // `Prose` and `Query.prose(uri:)`: Markdown sidecars served beside the
    // compiled graph; `Query.search`: text search over every node. See
    // `createProseExtensions` for why each is a root field.
    extensions: composeExtensions([
      createProseExtensions(),
      createSearchExtensions(),
    ]),
    incremental: true,
    mode: MODE,
    prefixing: PREFIXING,
    provider: PROVIDER,
    // Which release of each ref package the SDL was compiled from, so a
    // schema diff names its cause. The semantics tree is a working tree and
    // has no version to name; its presence shows in the types instead.
    revision: describeRefRoots(refRoots),
    sdlOutput: options.sdlOutput,
  });
  // biome-ignore lint/suspicious/noExplicitAny: the Plugin generic is invariant, so the heterogeneous plugin array needs `any` here — matching ke-graphql's own demo
  const plugins: Plugin<any>[] = [graphql];
  const store = await createStore({
    sources: sources.map((source) => ({
      content: source.content,
      path: source.path,
    })),
    prefixes,
    plugins,
  });
  const api = store.api<SchemaPluginApi>("ke-graphql");
  /* v8 ignore next 3 -- unreachable via this factory: the plugin is
     constructed two statements above and registers its API synchronously
     during createStore, so a missing API means ke changed its plugin
     protocol. Kept as a loud failure rather than an undefined dereference. */
  if (!api) {
    throw new Error("ke-graphql plugin did not register its API");
  }
  const query = createStoreQueryFn(store);
  const binding = await bindProseSidecars({
    sidecars,
    sources,
    prefixes,
    query,
  });
  for (const path of binding.unbound) {
    console.warn(
      `[graphql] prose sidecar ${path} names no entity in the graph and is not served. A sidecar is named after the local name of an entity the Turtle in its directory declares (<name>.md, or <name>.<lang>.md for a translation).`,
    );
  }
  // Built once, here, from the compiled schema itself: what search matches
  // is exactly what `_meta` serves, and a node that fails to read fails the
  // boot rather than the first search.
  const searchIndex = await indexSearch({
    schema: api.schema,
    context: api.createContext(store),
    query,
  });
  const handle = createGraphQLHandler(api.schema, {
    // A fresh context per request: ke-graphql's loaders, plus what the prose
    // and search resolvers read. The locale comes from the request, never
    // from state.
    context: (request) => ({
      ...api.createContext(store),
      locale: readRequestLocale(request),
      proseIndex: binding.index,
      searchIndex,
    }),
    graphiql: true,
    cors: true,
    incremental: true,
  });
  const destination =
    options.sdlOutput === undefined
      ? "SDL output disabled (no sdlOutput given)"
      : `SDL written to ${relative(process.cwd(), options.sdlOutput)}`;
  console.info(
    `[graphql] schema compiled from ${sources.length} TTL sources (${api.diagnostics.length} diagnostics), ${sidecars.length - binding.unbound.length} prose sidecars bound, ${searchIndex.length} nodes indexed for search — ${destination}`,
  );
  return { handle, api };
};

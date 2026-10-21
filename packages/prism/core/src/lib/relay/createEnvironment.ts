import {
  Environment,
  type FetchFunction,
  type GraphQLResponse,
  Network,
  RecordSource,
  Store,
} from "relay-runtime";
import {
  createRelayRuntimeNetwork,
  headersMiddleware,
  httpExecutor,
  persistedQueryMiddleware,
  type RelayFetchMiddleware,
  type RelayRuntimeFetch,
  urlMiddleware,
} from "relay-runtime-network";
import type { CreateEnvironmentOptions } from "./types.js";

/**
 * Owns the pipeline's incremental-payload stream so a failed operation cannot
 * take the process down.
 *
 * relay-runtime-network@0.1.0 gives every execution an incremental payload
 * stream whose `closed` promise it REJECTS when the pipeline throws. Nothing
 * in the library ever attaches a handler to that promise, so a plain fetch
 * failure — a graph server that is down, a refused connection — surfaces as
 * an UNHANDLED REJECTION, which Node treats as fatal. The caller's own
 * rejection is delivered separately and is handled (a prepare step catches it
 * and degrades), so this leak is pure collateral.
 *
 * This middleware runs FIRST, so the handler is attached before any later
 * middleware or the executor can throw. Marking a rejection as handled is all
 * it does; the error itself still propagates to the caller unchanged.
 */
const ownIncrementalStreamFailure: RelayFetchMiddleware =
  (next) => (context) => {
    context.incremental.stream.closed.catch(() => {});
    return next(context);
  };

/**
 * Builds the HTTP network that posts operations to `graphqlUrl`.
 *
 * `persistedQueryMiddleware` is the pipeline's request shaper — the fetch
 * envelope starts with `body: null`, and without a body-writing middleware
 * every POST goes out empty and the server answers 400 "Missing query".
 * Compiled artifacts without persisted ids take the full-text fallback
 * (`{operationName, variables, query}` + JSON content type); artifacts that
 * carry ids upgrade to them automatically.
 *
 * `headersMiddleware` sits AFTER `urlMiddleware` and BEFORE the request
 * shaper, on the default `"set"` merge strategy — so it overwrites only the
 * keys it names and leaves `persistedQueryMiddleware`'s content type alone.
 * ("replace" would clear every header first and break exactly that.)
 */
const createHttpNetwork = (
  graphqlUrl: string,
  headers: Readonly<Record<string, string>> | undefined,
) =>
  createRelayRuntimeNetwork({
    fetch: {
      executor: httpExecutor(),
      middlewares: [
        ownIncrementalStreamFailure,
        urlMiddleware({ url: graphqlUrl }),
        ...(headers ? [headersMiddleware({ headers: { ...headers } })] : []),
        persistedQueryMiddleware({
          fallbackToFullText: true,
          mode: "manifest",
        }),
      ],
    },
  });

/**
 * Adapts the pipeline's fetch to relay-runtime's `FetchFunction`. Both
 * describe the same GraphQL response wire shape, but relay-runtime types the
 * payload as `PayloadData` where the pipeline says `unknown`, and takes its
 * cache config as an interface where the pipeline wants a plain record —
 * hence the spread and the single response cast at this library boundary.
 */
const toFetchFunction =
  (fetchGraphQL: RelayRuntimeFetch): FetchFunction =>
  (params, variables, cacheConfig) =>
    fetchGraphQL(params, variables, {
      ...cacheConfig,
    }) as Promise<GraphQLResponse>;

/**
 * Resolve the environment's fetch function: the caller's own, or the HTTP
 * network to `graphqlUrl`.
 *
 * @throws When neither a `fetchFn` nor a non-empty `graphqlUrl` is given.
 */
const resolveFetchFunction = (
  options: CreateEnvironmentOptions,
): FetchFunction => {
  if (options.fetchFn !== undefined) return options.fetchFn;
  if (typeof options.graphqlUrl !== "string" || options.graphqlUrl === "") {
    throw new Error("createEnvironment: pass a graphqlUrl or a fetchFn");
  }
  return toFetchFunction(
    createHttpNetwork(options.graphqlUrl, options.headers).fetch,
  );
};

/**
 * The store's identity function: the graph's `uri`, never `id`.
 *
 * A Prism graph's `Node` is `{ uri: ID!  _meta: EntityMeta! }`: `uri`
 * carries the absolute IRI and there is no `id`. relay-compiler is told this
 * by its `schemaConfig.nodeInterfaceIdField`, but that is a COMPILE-TIME knob
 * only: it decides which field the `generate_id_field` transform injects
 * into a selection. It never reaches relay-runtime, whose `defaultGetDataID`
 * reads `fieldValue.id` unconditionally. Without this override every record
 * would normalise to a path-based client id (`client:root:component(uri:"…")`),
 * so the store would lose stable identity: no cross-query record sharing,
 * and every captured server snapshot keyed differently from the records a
 * live query writes.
 *
 * Returning `undefined` for values without a `uri` is deliberate: an
 * unaddressable value (a blank node) gets a client id from Relay, which is
 * exactly what it should get.
 */
const getDataID = (fieldValue: {
  readonly [key: string]: unknown;
}): string | undefined =>
  typeof fieldValue.uri === "string" ? fieldValue.uri : undefined;

/**
 * Creates a Relay `Environment` over a Prism graph.
 *
 * Call once per browser session (module scope in the client entry) and once
 * per request on the server, so no store state leaks across requests. Pass
 * `graphqlUrl` (with optional `headers`) to post over HTTP, or `fetchFn` to
 * replace the network; `records` seeds the store either way.
 *
 * @param options - The network and the optional seed records.
 * @returns A fresh environment with its own store.
 * @throws When neither `graphqlUrl` nor `fetchFn` is given.
 */
export const createEnvironment = (
  options: CreateEnvironmentOptions,
): Environment =>
  new Environment({
    getDataID,
    network: Network.create(resolveFetchFunction(options)),
    store: new Store(RecordSource.create(options.records)),
  });

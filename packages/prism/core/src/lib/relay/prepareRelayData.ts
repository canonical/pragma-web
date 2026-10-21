import type { AnyRoute, RouteMap } from "@canonical/router-core";
import type { Environment } from "relay-runtime";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { createStaticRouter } from "../router/index.js";
import createEnvironment from "./createEnvironment.js";
import {
  getPrefetchEnvironment,
  setPrefetchEnvironment,
} from "./prefetchEnvironment.js";
import type { PreparedRelayData, PrepareRelayDataOptions } from "./types.js";

/**
 * Throw unless the prefetch slot is empty.
 *
 * On the server the slot is empty everywhere outside `warmInEnvironment`, so
 * a published environment means another caller would share this request's
 * warm, and with it its store.
 *
 * @throws When an environment is already published.
 * @note Impure: reads the module-level prefetch environment.
 */
const assertNoPrefetchEnvironment = (): void => {
  if (getPrefetchEnvironment() !== undefined) {
    throw new Error(
      "a prefetch environment is already published; the server publishes " +
        "one only while a route's warm runs",
    );
  }
};

/**
 * Call `warm` with `environment` published as the prefetch environment, and
 * clear it again before returning.
 *
 * The environment is published only for the synchronous duration of the
 * call. A route's `warm` reads it synchronously when called (see
 * `prefetchQuery`), so the fetch it starts is already bound to
 * `environment` by the time the slot is cleared. Clearing before the caller
 * awaits is what keeps concurrent requests apart: the slot is one
 * module-level value, and a second request's static router runs its own
 * route's `warm` while it is being built, so a slot left published across
 * an await would hand that second request this request's environment.
 *
 * The caller has already asserted the slot empty: it must do so before
 * matching, because building the static router runs the matched route's
 * `warm` against whatever the slot holds.
 *
 * @param environment - The per-request environment to warm.
 * @param warm - Calls the matched route's `warm`.
 * @returns The `warm` call's result, as a promise.
 * @note Impure: writes the module-level prefetch environment, and the
 *   `warm` it calls performs network requests.
 */
const warmInEnvironment = (
  environment: Environment,
  warm: () => void | Promise<void>,
): Promise<void> => {
  setPrefetchEnvironment(environment);
  try {
    return Promise.resolve(warm());
  } finally {
    setPrefetchEnvironment(undefined);
  }
};

/**
 * The server-side data prepare step: match `url` against the site's routes,
 * await the matched route's `warm` against a per-request environment that
 * talks to `graphqlUrl`, and serialise that environment's store for
 * hydration.
 *
 * The order is: assert the prefetch slot empty; match; create the
 * environment; publish it, call the route's `warm` and clear it again, all
 * synchronously (`warmInEnvironment`); await the `warm`; serialise. The
 * environment is cleared BEFORE the await rather than after the serialise
 * because the prefetch slot is one module-level value shared by every
 * request in this process: left published across the await, it would
 * receive the `warm` of any request whose static router is built meanwhile,
 * costing an extra fetch and leaking that page's records into this one's
 * snapshot. Static routers the server builds later (to resolve the status,
 * to render) run their `warm` with the slot empty, so the page costs exactly
 * one graph request.
 *
 * The slot is asserted empty before matching, not just before publishing:
 * building the static router runs the matched route's `warm` synchronously,
 * so a check placed after the match would come after that `warm` had
 * already fetched into a foreign environment. A published slot fails the
 * step (logged `undefined`) without a single request.
 *
 * Only the route's own `warm` is awaited. The router runs every wrapper's
 * `warm` on each load as well; a wrapper's `warm` does not contribute to the
 * server-rendered store.
 *
 * Returns `undefined` for an unmatched URL, a redirect, the not-found page
 * and a route with no `warm`, all without dialling the graph. It also
 * returns `undefined` on any failure (an unreachable graph, an execution
 * error, a `warm` that throws), logging it: the page then renders without
 * server data, which is a degraded page rather than a 500.
 *
 * @param url - The request's path and query string.
 * @param graphqlUrl - The graph server's GraphQL endpoint.
 * @param options - The site's routes, middleware, not-found route and the
 *   headers to stamp on the graph requests.
 * @returns The serialised store, or `undefined` when there is none to send.
 * @note Impure: publishes and clears the module-level prefetch environment
 *   and performs network requests to the graph server.
 */
export default async function prepareRelayData<
  TRoutes extends RouteMap,
  TNotFound extends AnyRoute | undefined = undefined,
>(
  url: string,
  graphqlUrl: string,
  options: PrepareRelayDataOptions<TRoutes, TNotFound>,
): Promise<PreparedRelayData | undefined> {
  try {
    assertNoPrefetchEnvironment();
    const match = createStaticRouter(options.routes, url, {
      middleware: options.middleware,
      notFound: options.notFound,
    }).match;
    if (match?.kind !== "route") return undefined;
    const route: AnyRoute = match.route;
    const warm = route.warm;
    if (warm === undefined) return undefined;
    // A dedicated per-request environment (never a shared one), so the
    // serialised snapshot contains exactly this route's data.
    const environment = createEnvironment({
      graphqlUrl,
      headers: options.headers,
    });
    await warmInEnvironment(environment, () =>
      warm(match.params, match.search, {
        signal: new AbortController().signal,
      }),
    );
    // `RecordMap` isn't root-exported from relay-runtime (hence the deep
    // import above) and `toJSON()` returns the untyped JSON shape, hence
    // the cast back to the nominal type here.
    const records = environment.getStore().getSource().toJSON() as RecordMap;
    return { records };
  } catch (error) {
    console.error(
      `[ssr] relay prepare failed for ${url} against ${graphqlUrl} — rendering without server data`,
      error,
    );
    return undefined;
  }
}

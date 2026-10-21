import type { AnyRoute } from "@canonical/router-core";
import type { Environment } from "relay-runtime";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { createStaticRouter } from "#lib/router";
import {
  createEnvironment,
  getPrefetchEnvironment,
  setPrefetchEnvironment,
} from "#relay";
import { appRoutes, middleware, notFoundRoute } from "../routes.js";
import type { PreparedRelayData } from "./types.js";

/**
 * Marks the outgoing request as this app's own server-side traffic. The graph
 * server logs `ssr` vs `client` off it, which is what lets the e2e suite
 * prove a server-rendered first load made no BROWSER requests.
 */
const SSR_HEADERS = { "x-pragma-ssr": "1" } as const;

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
 * @param environment - The per-request environment to warm.
 * @param warm - Calls the matched route's `warm`.
 * @returns The `warm` call's result, as a promise.
 * @throws When an environment is already published: on the server the slot
 *   is empty everywhere outside this function, so a published one means two
 *   requests would share a store.
 * @note Impure: writes the module-level prefetch environment, and the
 *   `warm` it calls performs network requests.
 */
const warmInEnvironment = (
  environment: Environment,
  warm: () => void | Promise<void>,
): Promise<void> => {
  if (getPrefetchEnvironment() !== undefined) {
    throw new Error(
      "a prefetch environment is already published; the server publishes " +
        "one only while a route's warm runs",
    );
  }
  setPrefetchEnvironment(environment);
  try {
    return Promise.resolve(warm());
  } finally {
    setPrefetchEnvironment(undefined);
  }
};

/**
 * The server-side data prepare step: match `url`, await the matched route's
 * `warm` against a per-request environment that talks to `graphqlUrl`, and
 * serialise that environment's store for hydration.
 *
 * The order is: match; create the environment; publish it, call the route's
 * `warm` and clear it again, all synchronously (`warmInEnvironment`); await
 * the `warm`; serialise. The environment is cleared BEFORE the await rather
 * than after the serialise because the prefetch slot is one module-level
 * value shared by every request in this process: left published across the
 * await, it would receive the `warm` of any request whose static router is
 * built meanwhile, costing an extra fetch and leaking that page's records
 * into this one's snapshot. The static routers `resolveRouteStatus` and
 * `EntryServer` build later run their `warm` with the slot empty, so the
 * page costs exactly one graph request.
 *
 * The dev servers import this module, and the app's routes with it,
 * natively, while `EntryServer` loads through Vite's `ssrLoadModule` in a
 * separate module registry: the data pass must run to completion before
 * the render pass starts, and the render pass is what lives behind
 * `ssrLoadModule`. Each registry matches the URL on its own, and only plain
 * data (the serialised records) crosses between them. The preview bundle
 * shares one registry, where `EntryServer` builds its static router after
 * this step has cleared the slot.
 *
 * Only the route's own `warm` is awaited. The router runs every wrapper's
 * `warm` on each load as well; no wrapper in this app has one, and one
 * added later would not contribute to the server-rendered store.
 *
 * Returns `undefined` for an unmatched URL, a redirect, the not-found page
 * and a route with no `warm`, all without dialling the graph. It also
 * returns `undefined` on any failure (an unreachable graph, an execution
 * error, a `warm` that throws), logging it: the page then renders without
 * server data, which is a degraded page rather than a 500. `entry.tsx`
 * renders through a fetch function that always rejects, so a store this
 * step left cold fails loudly in the page's error state rather than
 * reaching the network during the render.
 *
 * The graph server drains incremental results itself. ke-graphql's HTTP
 * handler merges `@defer`/`@stream` payloads into one complete JSON
 * response whenever the request does not accept `multipart/mixed` exactly,
 * and relay-runtime's wildcard `Accept` header selects no media type
 * exactly, so this step always receives one complete response.
 *
 * @param url - The request's path and query string.
 * @param graphqlUrl - The graph server's GraphQL endpoint.
 * @returns The serialised store, or `undefined` when there is none to send.
 * @note Impure: publishes and clears the module-level prefetch environment
 *   and performs network requests to the graph server.
 */
export default async function prepareRelayData(
  url: string,
  graphqlUrl: string,
): Promise<PreparedRelayData | undefined> {
  try {
    const match = createStaticRouter(appRoutes, url, {
      middleware: [...middleware],
      notFound: notFoundRoute,
    }).match;
    if (match?.kind !== "route") return undefined;
    const route: AnyRoute = match.route;
    const warm = route.warm;
    if (warm === undefined) return undefined;
    // A dedicated per-request environment (never a shared one), so the
    // serialised snapshot contains exactly this route's data.
    const environment = createEnvironment({
      graphqlUrl,
      headers: SSR_HEADERS,
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

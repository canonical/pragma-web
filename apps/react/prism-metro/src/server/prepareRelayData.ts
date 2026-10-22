import {
  type PreparedRelayData,
  prepareRelayData as prepareRouteData,
} from "@canonical/prism-core";
import { appRoutes, notFoundRoute } from "../routes.js";
import selectRoutableUrl from "../selectRoutableUrl.js";

/**
 * The site's server-side data prepare step: prism-core's prepare step bound
 * to this site's route table and not-found route. It matches the URL, awaits
 * the route's `warm` against a per-request environment that talks to the
 * graph, and serialises the store for the render and the client.
 *
 * @param url - The request's path and query string.
 * @param graphqlUrl - The graph's GraphQL endpoint.
 * @returns The serialised store, or `undefined` for a URL with nothing to
 *   prepare (one no route matches, or whose path does not percent-decode)
 *   and when the prepare step fails.
 * @note Impure: publishes and clears the prefetch environment and performs
 *   network requests to the graph.
 */
export default function prepareRelayData(
  url: string,
  graphqlUrl: string,
): Promise<PreparedRelayData | undefined> {
  return prepareRouteData(selectRoutableUrl(url), graphqlUrl, {
    routes: appRoutes,
    notFound: notFoundRoute,
  });
}

import {
  type PreparedRelayData,
  prepareRelayData as prepareRouteData,
} from "@canonical/prism-core";
import { appRoutes, middleware, notFoundRoute } from "../routes.js";
import { SSR_HEADERS } from "./constants.js";

/**
 * The site's server-side data prepare step: prism-core's prepare step bound
 * to this site's route table, middleware and not-found route, with its graph
 * requests marked `x-pragma-ssr: 1`.
 *
 * The dev servers import this module, and the site's routes with it,
 * natively, while `EntryServer` loads through Vite's `ssrLoadModule` in a
 * separate module registry: the data pass must run to completion before the
 * render pass starts, and the render pass is what lives behind
 * `ssrLoadModule`. Each registry matches the URL on its own, and only plain
 * data (the serialised records) crosses between them. The preview bundle
 * shares one registry, where `EntryServer` builds its static router after
 * this step has cleared the prefetch slot.
 *
 * Only the route's own `warm` is awaited; no wrapper in this site has one.
 * `entry.tsx` renders through a fetch function that always rejects, so a
 * store this step left cold (logged `undefined`) fails loudly in the page's
 * error state rather than reaching the network during the render.
 *
 * The graph server drains incremental results itself. ke-graphql's HTTP
 * handler merges `@defer`/`@stream` payloads into one complete JSON response
 * whenever the request does not accept `multipart/mixed` exactly, and
 * relay-runtime's wildcard `Accept` header selects no media type exactly, so
 * this step always receives one complete response.
 *
 * @param url - The request's path and query string.
 * @param graphqlUrl - The graph server's GraphQL endpoint.
 * @returns The serialised store, or `undefined` when there is none to send.
 * @note Impure: publishes and clears the prefetch environment and performs
 *   network requests to the graph server.
 */
export default function prepareRelayData(
  url: string,
  graphqlUrl: string,
): Promise<PreparedRelayData | undefined> {
  return prepareRouteData(url, graphqlUrl, {
    routes: appRoutes,
    middleware: [...middleware],
    notFound: notFoundRoute,
    headers: SSR_HEADERS,
  });
}

import {
  createStaticRouter,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import type { AnyRoute } from "@canonical/router-core";
import type { Environment } from "relay-runtime";
import { SITE_ROUTES } from "./fixtures.js";

/**
 * Warm `environment` for `url` the way a site's server prepare step does:
 * match the URL against the site's routes with the prefetch slot empty,
 * publish the environment, call the matched route's `warm`, clear the slot
 * again before anything is awaited, and only then await the warm.
 *
 * Clearing the slot synchronously is what proves a route's `warm` binds its
 * every fetch to the environment it read when called: a second fetch that
 * read the slot later would find it empty and fetch nothing.
 *
 * @param environment - The environment to warm.
 * @param url - The page's path.
 * @returns A promise that settles when the route's `warm` does.
 * @throws When the URL matches no route, or the route has no `warm`.
 * @note Impure: writes the module-level prefetch environment, and the warm
 *   it calls performs network requests.
 */
export default async function warmRoute(
  environment: Environment,
  url: string,
): Promise<void> {
  const { match } = createStaticRouter(SITE_ROUTES, url);
  if (match?.kind !== "route") {
    throw new Error(`warmRoute: ${url} matches no route`);
  }
  // Widened to the router's own any-route shape, as the server's prepare
  // step reads it: the table's union of routes takes no common params type.
  const route: AnyRoute = match.route;
  const { warm } = route;
  if (warm === undefined) {
    throw new Error(`warmRoute: ${url} matches a route with no warm`);
  }
  setPrefetchEnvironment(environment);
  let pending: void | Promise<void>;
  try {
    pending = warm(match.params, match.search, {
      signal: new AbortController().signal,
    });
  } finally {
    setPrefetchEnvironment(undefined);
  }
  await pending;
}

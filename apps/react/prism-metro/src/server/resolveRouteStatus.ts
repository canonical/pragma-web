import { createStaticRouter } from "@canonical/prism-core";
import { appRoutes, notFoundRoute } from "../routes.js";
import selectRoutableUrl from "./selectRoutableUrl.js";

/**
 * The HTTP status the routed document deserves: the matched route's status,
 * 200, and 404 for every URL no route matches, a path that does not
 * percent-decode among them.
 *
 * `JSXRenderer` starts at 200 and moves only to 500 on a shell error, and it
 * takes its status at construction, so the server resolves the match before
 * it builds the renderer. The match is synchronous: one extra static match
 * per request.
 *
 * @param url - The request's path and query string.
 * @returns The status to answer with.
 */
export default function resolveRouteStatus(url: string): number {
  const match = createStaticRouter(appRoutes, selectRoutableUrl(url), {
    notFound: notFoundRoute,
  }).match;
  return match?.kind === "route" ? match.status : 404;
}

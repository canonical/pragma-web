import { createStaticRouter } from "#lib/router";
import { appRoutes, middleware, notFoundRoute } from "../routes.js";

/**
 * The HTTP status the routed document deserves: 200 for a matched route, 404
 * for everything else.
 *
 * WHY THE SERVER HAS TO ASK. `JSXRenderer` starts at 200 and only ever moves
 * to 500 on a shell error, so an unknown URL renders the not-found page and
 * still tells the client — and every crawler — that the page exists. The
 * renderer takes a `statusCode` option for exactly this, and it can only be
 * given at construction, which is why the match is resolved here rather than
 * read off the render.
 *
 * The match is SYNCHRONOUS, so this costs one extra static match per request
 * and no awaiting. A `redirect` route would carry a 3xx status of its own; it
 * is deliberately not passed through, because a redirect is a `Location`
 * header the entry point must send rather than a document to render, and no
 * route in this app is one today.
 */
export const resolveRouteStatus = (url: string): number => {
  const match = createStaticRouter(appRoutes, url, {
    middleware: [...middleware],
    notFound: notFoundRoute,
  }).match;
  return match?.kind === "route" ? match.status : 404;
};

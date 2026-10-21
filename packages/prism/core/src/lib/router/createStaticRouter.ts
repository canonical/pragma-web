import type {
  AnyRoute,
  RouteMap,
  Router,
  RouterMatch,
  RouterOptions,
} from "@canonical/router-core";
import { createRouter, createServerAdapter } from "@canonical/router-core";

/**
 * Create a static (server-positioned) router, for server-side rendering and
 * for tests that render a route at a fixed URL.
 *
 * Matches the URL synchronously and hydrates the store so `render()` works
 * immediately without awaiting `load()`. Prefetch fires in the background.
 * Unmatched URLs and redirects are not hydrated: the server answers those
 * before rendering.
 *
 * Built entirely from router-core's public API (`createRouter`,
 * `createServerAdapter` and `hydrate`), so every server path and test shares
 * one synchronous hydrate instead of re-implementing it.
 *
 * The match result is available via `staticRouter.match` for status code
 * determination before rendering.
 *
 * ```ts
 * const router = createStaticRouter(routes, req.url);
 *
 * if (!router.match) { res.status(404); }
 * else if (router.match.kind === "redirect") {
 *   return res.redirect(router.match.status, router.match.redirectTo);
 * }
 * ```
 *
 * @param routes - The route table.
 * @param url - The request URL, as a string or a `URL`.
 * @param options - Router options other than the adapter and initial URL.
 * @returns The router, with the URL's match result on `match`.
 */
export default function createStaticRouter<
  const TRoutes extends RouteMap,
  const TNotFound extends AnyRoute | undefined = undefined,
>(
  routes: TRoutes,
  url: string | URL,
  options?: Omit<RouterOptions<TNotFound>, "adapter" | "initialUrl">,
): Router<TRoutes, TNotFound> & {
  readonly match: RouterMatch<TRoutes, TNotFound> | null;
} {
  const router = createRouter(routes, {
    ...options,
    adapter: createServerAdapter(url),
  });

  const matchResult = router.match(url);
  const status = matchResult?.status ?? 404;
  const kind =
    matchResult?.kind === "route"
      ? "route"
      : matchResult?.kind === "not-found"
        ? "not-found"
        : "unmatched";
  const routeId = matchResult?.kind === "route" ? matchResult.name : null;

  if (kind !== "unmatched") {
    router.hydrate({
      href: typeof url === "string" ? url : url.href,
      kind,
      routeId,
      status,
    });
  }

  return Object.assign(router, {
    get match() {
      return matchResult;
    },
  });
}

/**
 * Types for the router-react hook domain.
 *
 * Each hook that accepts structured options or returns a structured value has
 * its props/result type defined here, keeping the hook implementations focused
 * on behaviour.
 */

import type { RouteArgs, RouteMap, RouteName } from "@canonical/router-core";

/** Mapping of selected search-param keys to their current values. */
export type SearchParamValues<TKeys extends readonly string[]> = Readonly<{
  [TKey in TKeys[number]]: string | null;
}>;

/** Options for `useRouterState()` power-user subscriptions. */
export interface UseRouterStateOptions<TSelected> {
  /**
   * Optional equality function used to preserve the previous selected value
   * when the next selection is semantically unchanged.
   */
  readonly isEqual?: (previous: TSelected, next: TSelected) => boolean;
}

/**
 * The build options `useHref` takes after the route name: core's own
 * `RouteArgs`, so params and search are checked exactly as `buildPath` and
 * `Link` check them.
 */
export type UseHrefProps<
  TRoutes extends RouteMap,
  TName extends RouteName<TRoutes>,
> = RouteArgs<TRoutes, TName>;

/** The href `useHref` resolves: the path, then the query string and the hash. */
export type UseHrefResult = string;

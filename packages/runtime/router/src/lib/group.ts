import type {
  AnyRoute,
  AnyWrapper,
  GroupedRouteMap,
  GroupedRoutes,
  RouteMap,
} from "./types.js";

/** Return a copy of a route with a wrapper annotation prepended to its wrappers. */
function prependWrapper(
  nextWrapper: AnyWrapper,
  currentRoute: AnyRoute,
): AnyRoute {
  return { ...currentRoute, wrappers: [nextWrapper, ...currentRoute.wrappers] };
}

/** Tell a flat route list from a named route record, keeping the list's element type. */
function isRouteList(
  routes: readonly AnyRoute[] | RouteMap,
): routes is readonly AnyRoute[] {
  return Array.isArray(routes);
}

/** Prepend a wrapper annotation to every route in a flat route list; positional types survive destructuring. */
export default function group<
  TWrapper extends AnyWrapper,
  TRoutes extends readonly AnyRoute[],
>(nextWrapper: TWrapper, routes: TRoutes): GroupedRoutes<TWrapper, TRoutes>;
/**
 * Prepend a wrapper annotation to every route in a named route record.
 *
 * Each route keeps its name, so the result spreads straight into the app's
 * route map. An object literal needs no `as const`: its keys and route types
 * are inferred as written. The call is pure: it returns new route objects and
 * leaves the input record and its routes untouched.
 */
export default function group<
  TWrapper extends AnyWrapper,
  TRoutes extends RouteMap,
>(nextWrapper: TWrapper, routes: TRoutes): GroupedRouteMap<TWrapper, TRoutes>;
export default function group(
  nextWrapper: AnyWrapper,
  routes: readonly AnyRoute[] | RouteMap,
): unknown {
  if (isRouteList(routes)) {
    return routes.map((currentRoute) =>
      prependWrapper(nextWrapper, currentRoute),
    );
  }

  return Object.fromEntries(
    Object.entries(routes).map(([name, currentRoute]) => [
      name,
      prependWrapper(nextWrapper, currentRoute),
    ]),
  );
}

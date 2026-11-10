import type { RouteMap, RouteName } from "@canonical/router-core";
import type { RegisteredRouteMap } from "../register.js";
import type { UseHrefProps, UseHrefResult } from "./types.js";
import useRouter from "./useRouter.js";

/**
 * Resolve the href of a named route through the nearest `RouterProvider`'s
 * `buildPath`.
 *
 * It takes the same route name and build options as `Link`'s `to`, `params`,
 * `search` and `hash`, checked the same way: `params` is required exactly
 * when the route's path declares params, and `search` is typed by the search
 * schema's input. It does not subscribe to router state, because the href
 * depends only on the route table and the arguments. Use it where a component
 * needs an href but renders its own anchor, such as a `LinkComponent`
 * adapter, or for `window.open` and a form `action`.
 *
 * With a union of route names, the build options are required as soon as one
 * member of the union declares params, exactly as for `buildPath`; pass one
 * literal name for full checking. A registered route map infers the name from
 * the argument; with explicit generics, pass the name as the second type
 * argument too, or `TName` stays the union of every route name.
 *
 * @param name - The route's name in the route map.
 * @param args - The build options: `params`, `search` and `hash`; omitted for
 * a route whose path declares no params.
 * @returns The route's href: its path, then the query string and the hash.
 * @throws When called outside a `RouterProvider`.
 */
export default function useHref<
  TRoutes extends RouteMap = RegisteredRouteMap,
  TName extends RouteName<TRoutes> = RouteName<TRoutes>,
>(name: TName, ...args: UseHrefProps<TRoutes, TName>): UseHrefResult {
  return useRouter<TRoutes>().buildPath(name, ...args);
}

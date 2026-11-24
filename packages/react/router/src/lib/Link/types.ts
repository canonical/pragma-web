import type {
  PathBuildOptions,
  RouteMap,
  RouteName,
  RouteOf,
} from "@canonical/router-core";
import type { ComponentProps } from "react";

/**
 * The route-building half of these props is core's `PathBuildOptions`
 * itself, not a structural duplicate of it: a copy would keep compiling
 * against a stale contract (accepting, say, non-serializable `search`
 * values) long after core tightened it.
 */
type OwnProps<TRoutes extends RouteMap, TName extends RouteName<TRoutes>> = {
  /** The named route to navigate to. */
  readonly to: TName;
} & PathBuildOptions<RouteOf<TRoutes, TName>>;

/**
 * Props accepted by `Link`.
 *
 * `href` is excluded from the anchor's native props because it is derived
 * from the chosen route rather than supplied by the caller. The own keys are
 * listed literally rather than as `keyof OwnProps`: `PathBuildOptions` is a
 * conditional mapped type, so `keyof` of it does not resolve while `TName` is
 * still a type parameter.
 */
export type LinkProps<
  TRoutes extends RouteMap,
  TName extends RouteName<TRoutes>,
> = OwnProps<TRoutes, TName> &
  Omit<
    ComponentProps<"a">,
    "to" | "params" | "search" | "hash" | "replace" | "href"
  >;

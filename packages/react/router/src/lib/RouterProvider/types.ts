import type { AnyRoute, RouteMap, Router } from "@canonical/router-core";
import type { ReactNode } from "react";

/** A router instance widened to the fully dynamic React binding shape. */
export type AnyReactRouter = Router<RouteMap, AnyRoute | undefined>;

/**
 * Props accepted by `RouterProvider`.
 *
 * Exempt from the native-prop extension convention: `RouterProvider` renders
 * a context provider and no DOM element, so it has no root tag whose native
 * props these could extend.
 */
export interface RouterProviderProps<
  TRoutes extends RouteMap,
  TNotFound extends AnyRoute | undefined = undefined,
> {
  /** React children that should be able to consume the router. */
  readonly children?: ReactNode;
  /** The router instance made available to descendants. */
  readonly router: Router<TRoutes, TNotFound>;
}

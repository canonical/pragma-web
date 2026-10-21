import type { AnyRoute, RouteMap, Router } from "@canonical/router-core";
import type { IEnvironment } from "relay-runtime";

/** Props accepted by `Shell`. */
export interface ShellProps<
  TRoutes extends RouteMap,
  TNotFound extends AnyRoute | undefined = undefined,
> {
  /** The router whose matched route renders through the nest's `Outlet`. */
  readonly router: Router<TRoutes, TNotFound>;
  /**
   * The Relay environment every query and fragment below the nest reads: the
   * browser session's on the client, the request's own on the server.
   */
  readonly environment: IEnvironment;
}

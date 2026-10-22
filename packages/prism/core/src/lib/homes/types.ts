import type { AnyRoute, RouteMap, Router } from "@canonical/router-core";
import type {
  RegisteredNotFound,
  RegisteredRouteMap,
} from "@canonical/router-react";
import type { ReactNode } from "react";

/** The part of a graph node a home needs: its concrete type and its address. */
export interface HomeNode {
  /** The node's concrete GraphQL type, which picks its resolver. */
  readonly __typename: string;
  /** The node's address in the graph. */
  readonly uri: string;
}

/**
 * Resolves a node to its canonical home: the href of the page that owns it,
 * built through the router so the address follows the route table.
 */
export type HomeResolver<
  TRoutes extends RouteMap = RegisteredRouteMap,
  TNotFound extends AnyRoute | undefined = RegisteredNotFound,
> = (node: HomeNode, router: Router<TRoutes, TNotFound>) => string;

/**
 * A site's homes: one resolver per `__typename`, and `Node` as the fallback
 * for every type without its own.
 */
export type Homes<
  TRoutes extends RouteMap = RegisteredRouteMap,
  TNotFound extends AnyRoute | undefined = RegisteredNotFound,
> = Readonly<Record<string, HomeResolver<TRoutes, TNotFound>>>;

/** Props accepted by `HomesProvider`. */
export interface HomesProviderProps {
  /** The site's homes. */
  readonly homes: Homes;
  /** The routed content that resolves homes. */
  readonly children: ReactNode;
}

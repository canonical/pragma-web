import type {
  AnyRoute,
  RouteMap,
  RouteMiddleware,
} from "@canonical/router-core";
import type { FetchFunction } from "relay-runtime";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";

/**
 * How an environment reaches the graph: over HTTP to `graphqlUrl`, or
 * through a `fetchFn` that replaces the network wholesale. Exactly one of the
 * two is given; the other is absent.
 */
type EnvironmentNetworkOptions =
  | {
      /**
       * The graph's GraphQL endpoint. There is no default: the site decides
       * where its graph lives and passes the address in.
       */
      readonly graphqlUrl: string;
      /**
       * Extra headers stamped onto every outgoing request. This is the one
       * per-request seam between a site and its provider: a consumer's
       * prepare step stamps its server traffic, and a request locale travels
       * the same way. The provider reads the headers when it builds its
       * request context.
       */
      readonly headers?: Readonly<Record<string, string>>;
      readonly fetchFn?: undefined;
    }
  | {
      /**
       * Replaces the HTTP network entirely: every operation executes through
       * this function. A server render passes one that always rejects, so a
       * render that misses the prepared store fails loudly in its suspended
       * boundary instead of reaching the network; tests pass a spy.
       */
      readonly fetchFn: FetchFunction;
      readonly graphqlUrl?: undefined;
      readonly headers?: undefined;
    };

/** Options for `createEnvironment`. */
export type CreateEnvironmentOptions = EnvironmentNetworkOptions & {
  /**
   * Serialised record map to seed the store with — the output of
   * `environment.getStore().getSource().toJSON()` on the server, delivered
   * to the client in the page's initial data. A fully walkable snapshot
   * renders without any network request (no `queryCacheExpirationTime` is
   * configured, so restored records are never considered stale).
   */
  readonly records?: RecordMap;
};

/** Options for `prepareRelayData`: the route table it matches against. */
export interface PrepareRelayDataOptions<
  TRoutes extends RouteMap = RouteMap,
  TNotFound extends AnyRoute | undefined = AnyRoute | undefined,
> {
  /** The site's route table. */
  readonly routes: TRoutes;
  /** The site's route middleware, applied while matching. */
  readonly middleware?: readonly RouteMiddleware[];
  /** The site's not-found route; a URL that lands on it prepares nothing. */
  readonly notFound?: TNotFound;
  /**
   * Headers stamped onto the prepare step's graph requests (see
   * `CreateEnvironmentOptions`), such as a marker that tells the graph
   * server a request is server-side traffic.
   */
  readonly headers?: Readonly<Record<string, string>>;
}

/** The serialised store snapshot a server render hands to the client. */
export interface PreparedRelayData {
  readonly records: RecordMap;
}

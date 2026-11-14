import {
  getPrefetchEnvironment,
  type ViewSearch,
  warmPageRenderer,
} from "@canonical/prism-core";
import { expandAddress, readUriParam } from "@canonical/prism-lens-entity";
import {
  type CacheConfig,
  type ConcreteRequest,
  type Environment,
  fetchQuery,
} from "relay-runtime";
import type { FleetNamespacesQuery } from "#relay/__generated__/FleetNamespacesQuery.graphql.js";
import fleetNamespacesQueryNode from "#relay/__generated__/FleetNamespacesQuery.graphql.js";

/** Answer from the store when it holds the data, and fetch otherwise. */
const STORE_OR_NETWORK: CacheConfig & {
  readonly fetchPolicy: "store-or-network";
} = { fetchPolicy: "store-or-network" };

/**
 * Warm the store for one fleet page, in the two steps the entity lens's
 * pages take: the graph's namespaces, then the page's own operation, whose
 * `node(id:)` takes the absolute IRI the namespaces expand the route's
 * compact address to, and, beside it, what the address's page renderer
 * reads of that IRI (the Turtle source at `as=turtle`).
 *
 * The environment is read once, synchronously, at the call: the server
 * publishes it only while a route's `warm` runs synchronously, so a second
 * read after the namespaces arrive would find none. Both steps run against
 * it under the `store-or-network` policy, so in the browser a store the
 * server already seeded answers both with no request.
 *
 * @param query - The page's operation, taking the node's IRI as `id`.
 * @param params - The matched route params, carrying the percent-decoded
 *   `uri`.
 * @param search - The matched view search, selecting the page renderer.
 * @returns A promise that settles when the store holds both operations'
 *   data, at once when no environment is published, or rejects with the
 *   first fetch's error.
 * @throws When the params carry no `uri`.
 * @note Impure: reads the module-level prefetch environment and performs up
 *   to three network requests through it.
 */
export default function warmFleetNode(
  query: ConcreteRequest,
  params: Readonly<Record<string, unknown>>,
  search: ViewSearch = {},
): Promise<void> {
  const address = readUriParam(params);
  const environment = getPrefetchEnvironment();
  if (environment === undefined) return Promise.resolve();
  return fetchQuery<FleetNamespacesQuery>(
    environment,
    fleetNamespacesQueryNode,
    {},
    STORE_OR_NETWORK,
  )
    .toPromise()
    .then((namespaces) =>
      warmFleetPage(
        environment,
        query,
        {
          id: expandAddress(
            address,
            /* v8 ignore next -- the observable yields the response before it completes */
            namespaces?.ontologies ?? [],
          ),
        },
        search,
      ),
    );
}

/**
 * Warm the page's own operation and, beside it, what the address's page
 * renderer reads of the expanded IRI.
 *
 * @param environment - The environment both requests go through.
 * @param query - The page's operation.
 * @param variables - The operation's variables, carrying the expanded IRI
 *   as `id`.
 * @param search - The matched view search, selecting the page renderer.
 * @returns A promise that settles when both are warm, or rejects with the
 *   page operation's error.
 * @note Impure: performs up to two network requests through the
 *   environment.
 */
function warmFleetPage(
  environment: Environment,
  query: ConcreteRequest,
  variables: { readonly id: string },
  search: ViewSearch,
): Promise<void> {
  return Promise.all([
    fetchQuery(environment, query, variables, STORE_OR_NETWORK).toPromise(),
    warmPageRenderer(variables.id, search, environment),
  ]).then(() => undefined);
}

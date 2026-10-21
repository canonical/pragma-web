import {
  type EntityBinding,
  getPrefetchEnvironment,
} from "@canonical/prism-core";
import { type CacheConfig, fetchQuery } from "relay-runtime";
import type { EntityNamespacesQuery } from "../__generated__/EntityNamespacesQuery.graphql.js";
import type { EntityPageQuery } from "../__generated__/EntityPageQuery.graphql.js";
import {
  buildEntityPageVariables,
  entityNamespacesQueryNode,
  entityPageQueryNode,
  readUriParam,
} from "./entityPageQuery.js";

/** Answer from the store when it holds the data, and fetch otherwise. */
const STORE_OR_NETWORK: CacheConfig & {
  readonly fetchPolicy: "store-or-network";
} = { fetchPolicy: "store-or-network" };

/**
 * Warm the store for one entity's page, in two steps: the graph's
 * namespaces, then the page's own operation, whose `node(id:)` takes the
 * absolute IRI the namespaces expand the route's address to.
 *
 * It cannot go through `prefetchQuery` twice. `prefetchQuery` reads the
 * published prefetch environment when it is called, and the server publishes
 * one only while a route's `warm` runs synchronously: by the time the
 * namespaces have arrived the slot is empty again, and a second
 * `prefetchQuery` would fetch nothing. So this reads the environment once,
 * synchronously, and runs both steps against it, each with relay-runtime's
 * `fetchQuery` under the `store-or-network` policy, the same "store hit,
 * else fetch" rule `prefetchQuery` applies: in the browser, a store the
 * server already seeded answers both steps with no request.
 *
 * @param binding - The binding whose class the entity must belong to.
 * @param params - The matched route params, carrying the percent-decoded
 *   `uri`.
 * @returns A promise that settles when the store holds both operations'
 *   data, at once when no environment is published, or rejects with the
 *   first fetch's error.
 * @throws When the params carry no `uri`.
 * @note Impure: reads the module-level prefetch environment and performs up
 *   to two network requests through it.
 */
export default function warmEntity(
  binding: EntityBinding,
  params: Readonly<Record<string, unknown>>,
): Promise<void> {
  const uri = readUriParam(params);
  const environment = getPrefetchEnvironment();
  if (environment === undefined) return Promise.resolve();
  return fetchQuery<EntityNamespacesQuery>(
    environment,
    entityNamespacesQueryNode,
    {},
    STORE_OR_NETWORK,
  )
    .toPromise()
    .then((namespaces) =>
      fetchQuery<EntityPageQuery>(
        environment,
        entityPageQueryNode,
        buildEntityPageVariables(
          binding,
          uri,
          /* v8 ignore next -- the observable yields the response before it completes */
          namespaces?.ontologies ?? [],
        ),
        STORE_OR_NETWORK,
      ).toPromise(),
    )
    .then(() => undefined);
}

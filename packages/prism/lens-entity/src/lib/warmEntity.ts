import {
  type EntityBinding,
  getPrefetchEnvironment,
  type ViewSearch,
  warmPageRenderer,
} from "@canonical/prism-core";
import { type CacheConfig, type Environment, fetchQuery } from "relay-runtime";
import type { EntityNamespacesQuery } from "../__generated__/EntityNamespacesQuery.graphql.js";
import entityNamespacesQueryNode from "../__generated__/EntityNamespacesQuery.graphql.js";
import type { EntityPageQuery } from "../__generated__/EntityPageQuery.graphql.js";
import entityPageQueryNode from "../__generated__/EntityPageQuery.graphql.js";
import buildEntityPageVariables from "./buildEntityPageVariables.js";
import readUriParam from "./readUriParam.js";

/** Answer from the store when it holds the data, and fetch otherwise. */
const STORE_OR_NETWORK: CacheConfig & {
  readonly fetchPolicy: "store-or-network";
} = { fetchPolicy: "store-or-network" };

/**
 * Warm the store for one entity's page, in two steps: the graph's
 * namespaces, then the page's own operation, whose `node(id:)` takes the
 * absolute IRI the namespaces expand the route's address to, beside what
 * the address's page renderer reads of that IRI.
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
 * @param search - The matched view search: beside the page's operation,
 *   the page renderer it selects is warmed for the expanded IRI, so the
 *   server's Turtle page carries its document.
 * @returns A promise that settles when the store holds both operations'
 *   data, at once when no environment is published, or rejects with the
 *   first fetch's error.
 * @throws When the params carry no `uri`.
 * @note Impure: reads the module-level prefetch environment and performs up
 *   to three network requests through it.
 */
export default function warmEntity(
  binding: EntityBinding,
  params: Readonly<Record<string, unknown>>,
  search: ViewSearch = {},
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
      warmEntityPage(
        environment,
        buildEntityPageVariables(
          binding,
          uri,
          /* v8 ignore next -- the observable yields the response before it completes */
          namespaces?.ontologies ?? [],
        ),
        search,
      ),
    );
}

/**
 * Warm the page's own operation and, beside it, what the address's page
 * renderer reads of the expanded IRI.
 *
 * @param environment - The environment both requests go through.
 * @param variables - The page operation's variables, carrying the
 *   expanded IRI as `id`.
 * @param search - The matched view search, selecting the page renderer.
 * @returns A promise that settles when both are warm, or rejects with the
 *   page operation's error.
 * @note Impure: performs up to two network requests through the
 *   environment.
 */
function warmEntityPage(
  environment: Environment,
  variables: EntityPageQuery["variables"],
  search: ViewSearch,
): Promise<void> {
  return Promise.all([
    fetchQuery<EntityPageQuery>(
      environment,
      entityPageQueryNode,
      variables,
      STORE_OR_NETWORK,
    ).toPromise(),
    warmPageRenderer(variables.id, search, environment),
  ]).then(() => undefined);
}

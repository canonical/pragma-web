import { type CacheConfig, type Environment, fetchQuery } from "relay-runtime";
import type { EntityNamespacesQuery } from "../__generated__/EntityNamespacesQuery.graphql.js";
import entityNamespacesQueryNode from "../__generated__/EntityNamespacesQuery.graphql.js";
import type { EntityPanelQuery } from "../__generated__/EntityPanelQuery.graphql.js";
import entityPanelQueryNode from "../__generated__/EntityPanelQuery.graphql.js";
import type { EntityStatementsQuery } from "../__generated__/EntityStatementsQuery.graphql.js";
import entityStatementsQueryNode from "../__generated__/EntityStatementsQuery.graphql.js";

/** Answer from the store when it holds the data, and fetch otherwise. */
const STORE_OR_NETWORK: CacheConfig & {
  readonly fetchPolicy: "store-or-network";
} = { fetchPolicy: "store-or-network" };

/**
 * Warm the store for `EntityPanel` on one entity: the graph's namespaces,
 * the entity's identity and its statements, the three operations the panel
 * reads, so a route that shows the panel server-renders it without a
 * request of its own. A site's route calls it from its `warm`, with the
 * environment it read there and the entity's absolute IRI.
 *
 * `import { warmEntityPanel } from "@canonical/prism-lens-entity";`
 *
 * @param environment - The environment the route's warm read.
 * @param uri - The entity's absolute IRI.
 * @returns A promise that settles when the store holds the panel's data, or
 *   rejects with the identity's or the namespaces' fetch error. A provider
 *   that does not serve `statements` refuses that field; the panel then
 *   never asks for it, so that refusal settles the promise all the same.
 * @note Impure: performs up to three network requests through
 *   `environment`, under the `store-or-network` policy.
 */
export default function warmEntityPanel(
  environment: Environment,
  uri: string,
): Promise<void> {
  return Promise.all([
    fetchQuery<EntityNamespacesQuery>(
      environment,
      entityNamespacesQueryNode,
      {},
      STORE_OR_NETWORK,
    ).toPromise(),
    fetchQuery<EntityPanelQuery>(
      environment,
      entityPanelQueryNode,
      { id: uri },
      STORE_OR_NETWORK,
    ).toPromise(),
    fetchQuery<EntityStatementsQuery>(
      environment,
      entityStatementsQueryNode,
      { uri },
      STORE_OR_NETWORK,
    )
      .toPromise()
      .catch(() => undefined),
  ]).then(() => undefined);
}

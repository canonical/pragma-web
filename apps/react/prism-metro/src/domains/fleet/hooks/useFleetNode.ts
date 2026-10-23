import { expandAddress } from "@canonical/prism-lens-entity";
import { useLazyLoadQuery } from "react-relay";
import type { FleetNamespacesQuery } from "#relay/__generated__/FleetNamespacesQuery.graphql.js";
import fleetNamespacesQueryNode from "#relay/__generated__/FleetNamespacesQuery.graphql.js";
import type {
  FleetNodeOperation,
  UseFleetNodeProps,
  UseFleetNodeResult,
} from "./types.js";

/**
 * Read one fleet page's operation for the node a route's address names, in
 * the two steps `warmFleetNode` warms: the graph's namespaces, which expand
 * a compact address to the absolute IRI `node(id:)` takes, then the page's
 * own operation with that IRI.
 *
 * Both reads suspend until their data is in the store, so the caller sits
 * inside a Suspense boundary; on a page the server rendered or a route
 * whose `warm` ran, both answer from the store with no request.
 *
 * @param props - The page's operation and the route's address.
 * @returns The operation's response.
 * @note Impure: reads, and may fetch into, the Relay environment in
 *   context.
 */
export default function useFleetNode<TQuery extends FleetNodeOperation>({
  query,
  address,
}: UseFleetNodeProps): UseFleetNodeResult<TQuery> {
  const { ontologies } = useLazyLoadQuery<FleetNamespacesQuery>(
    fleetNamespacesQueryNode,
    {},
  );
  return useLazyLoadQuery<TQuery>(query, {
    id: expandAddress(address, ontologies),
  });
}

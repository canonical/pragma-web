import type { GraphQLTaggedNode, OperationType } from "relay-runtime";

/** An operation that reads one node by its absolute IRI, as `id`. */
export interface FleetNodeOperation extends OperationType {
  readonly variables: { readonly id: string };
}

/** What `useFleetNode` takes: a page's operation and the route's address. */
export interface UseFleetNodeProps {
  /** The page's compiled operation, reading the node as `node(id:)`. */
  readonly query: GraphQLTaggedNode;
  /** The route's address, compact or absolute. */
  readonly address: string;
}

/** What `useFleetNode` returns: the operation's response. */
export type UseFleetNodeResult<TQuery extends FleetNodeOperation> =
  TQuery["response"];

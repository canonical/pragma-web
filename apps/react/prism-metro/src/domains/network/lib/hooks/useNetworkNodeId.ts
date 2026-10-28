import { useLazyLoadQuery } from "react-relay";
import networkNamespacesQueryNode, {
  type NetworkNamespacesQuery,
} from "#relay/__generated__/NetworkNamespacesQuery.graphql.js";
import buildNetworkNodeVariables from "../buildNetworkNodeVariables.js";
import type { UseNetworkNodeIdProps, UseNetworkNodeIdResult } from "./types.js";

/**
 * Read the IRI a network page's address names: the graph's namespaces,
 * then the address expanded through them. It suspends while the namespaces
 * are in flight; the store answers them after the first page.
 *
 * @param props - The page's address.
 * @returns The IRI `node(id:)` takes.
 */
export default function useNetworkNodeId({
  address,
}: UseNetworkNodeIdProps): UseNetworkNodeIdResult {
  const { ontologies } = useLazyLoadQuery<NetworkNamespacesQuery>(
    networkNamespacesQueryNode,
    {},
    { fetchPolicy: "store-or-network" },
  );
  return buildNetworkNodeVariables(address, ontologies).id;
}

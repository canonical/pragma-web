import { useLazyLoadQuery } from "react-relay";
import networkLineQueryNode, {
  type NetworkLineQuery,
} from "#relay/__generated__/NetworkLineQuery.graphql.js";
import readLineView from "../readLineView.js";
import type { UseLineViewProps, UseLineViewResult } from "./types.js";
import useNetworkNodeId from "./useNetworkNodeId.js";

/**
 * Read one line's page view: its address expanded through the graph's
 * namespaces, then the line query for that IRI. It suspends while either
 * query is in flight.
 *
 * @param props - The line's address.
 * @returns The view, or undefined when the graph has no such line.
 */
export default function useLineView({
  address,
}: UseLineViewProps): UseLineViewResult {
  const { node } = useLazyLoadQuery<NetworkLineQuery>(
    networkLineQueryNode,
    { id: useNetworkNodeId({ address }) },
    { fetchPolicy: "store-or-network" },
  );
  return node ? readLineView(node) : undefined;
}

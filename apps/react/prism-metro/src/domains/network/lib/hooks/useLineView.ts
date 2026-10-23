import { useLazyLoadQuery } from "react-relay";
import networkLineQueryNode, {
  type NetworkLineQuery,
} from "../../../../relay/__generated__/NetworkLineQuery.graphql.js";
import readLineView from "../readLineView.js";
import resolveNetworkAddress from "../resolveNetworkAddress.js";
import type { UseLineViewProps, UseLineViewResult } from "./types.js";
import useNetworkLines from "./useNetworkLines.js";

/**
 * Read one line's page view: its address resolved against the network, then
 * the line query for the IRI it resolves to. An address the network does not
 * route reads the store only, finds nothing and makes no request. It
 * suspends while either query is in flight.
 *
 * @param props - The line's address.
 * @returns The view, or undefined when the network has no such line.
 */
export default function useLineView({
  address,
}: UseLineViewProps): UseLineViewResult {
  const id = resolveNetworkAddress(address, useNetworkLines(), "line");
  const { node } = useLazyLoadQuery<NetworkLineQuery>(
    networkLineQueryNode,
    { id: id ?? address },
    { fetchPolicy: id === undefined ? "store-only" : "store-or-network" },
  );
  return node ? readLineView(node) : undefined;
}

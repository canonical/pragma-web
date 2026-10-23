import { useLazyLoadQuery } from "react-relay";
import networkStationQueryNode, {
  type NetworkStationQuery,
} from "../../../../relay/__generated__/NetworkStationQuery.graphql.js";
import readStationView from "../readStationView.js";
import resolveNetworkAddress from "../resolveNetworkAddress.js";
import type { UseStationViewProps, UseStationViewResult } from "./types.js";
import useNetworkLines from "./useNetworkLines.js";

/**
 * Read one station's page view: its address resolved against the network,
 * then the station query for the IRI it resolves to. An address the network
 * does not route reads the store only, finds nothing and makes no request.
 * It suspends while either query is in flight.
 *
 * @param props - The station's address.
 * @returns The view, or undefined when the network has no such station.
 */
export default function useStationView({
  address,
}: UseStationViewProps): UseStationViewResult {
  const id = resolveNetworkAddress(address, useNetworkLines(), "stop");
  const { node } = useLazyLoadQuery<NetworkStationQuery>(
    networkStationQueryNode,
    { id: id ?? address },
    { fetchPolicy: id === undefined ? "store-only" : "store-or-network" },
  );
  return node ? readStationView(node) : undefined;
}

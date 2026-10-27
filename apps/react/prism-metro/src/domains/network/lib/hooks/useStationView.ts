import { useLazyLoadQuery } from "react-relay";
import networkStationQueryNode, {
  type NetworkStationQuery,
} from "#relay/__generated__/NetworkStationQuery.graphql.js";
import readStationView from "../readStationView.js";
import type { UseStationViewProps, UseStationViewResult } from "./types.js";
import useNetworkNodeId from "./useNetworkNodeId.js";

/**
 * Read one station's page view: its address expanded through the graph's
 * namespaces, then the station query for that IRI. It suspends while either
 * query is in flight.
 *
 * @param props - The station's address.
 * @returns The view, or undefined when the graph has no such station.
 */
export default function useStationView({
  address,
}: UseStationViewProps): UseStationViewResult {
  const { node } = useLazyLoadQuery<NetworkStationQuery>(
    networkStationQueryNode,
    { id: useNetworkNodeId({ address }) },
    { fetchPolicy: "store-or-network" },
  );
  return node ? readStationView(node) : undefined;
}

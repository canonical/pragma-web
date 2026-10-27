import { useMemo } from "react";
import { useLazyLoadQuery } from "react-relay";
import networkMapQueryNode, {
  type NetworkMapQuery,
} from "#relay/__generated__/NetworkMapQuery.graphql.js";
import buildNetworkMapVariables from "../../buildNetworkMapVariables.js";
import readNetworkIndex from "../readNetworkIndex.js";
import type { UseNetworkIndexResult } from "./types.js";

/**
 * Read the inspector's lists through the map query, with the same variables
 * the map reads it with, so the map's request answers both. It suspends
 * while the query is in flight.
 *
 * @returns The lines' and the stations' keys, in their lists' order.
 */
export default function useNetworkIndex(): UseNetworkIndexResult {
  const data = useLazyLoadQuery<NetworkMapQuery>(
    networkMapQueryNode,
    buildNetworkMapVariables(),
    { fetchPolicy: "store-or-network" },
  );
  return useMemo(() => readNetworkIndex(data), [data]);
}

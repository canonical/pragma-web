import { useMemo } from "react";
import { useLazyLoadQuery } from "react-relay";
import networkMapQueryNode, {
  type NetworkMapQuery,
} from "../../../../relay/__generated__/NetworkMapQuery.graphql.js";
import buildNetworkMapVariables from "../../buildNetworkMapVariables.js";
import readDiagramLines from "../readDiagramLines.js";
import type { UseNetworkLinesResult } from "./types.js";

/**
 * Read the network's lines through the map query, with the same variables
 * the routes' warm functions fetch it with, so a warm store answers at once.
 * It suspends while the query is in flight.
 *
 * @returns The lines, as the map draws them.
 */
export default function useNetworkLines(): UseNetworkLinesResult {
  const data = useLazyLoadQuery<NetworkMapQuery>(
    networkMapQueryNode,
    buildNetworkMapVariables(),
    { fetchPolicy: "store-or-network" },
  );
  return useMemo(() => readDiagramLines(data), [data]);
}

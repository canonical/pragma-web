import { useLazyLoadQuery } from "react-relay";
import type { FleetIndexQuery } from "#relay/__generated__/FleetIndexQuery.graphql.js";
import fleetIndexQueryNode from "#relay/__generated__/FleetIndexQuery.graphql.js";
import { FLEET_CLASS_URI, FLEET_PAGE_SIZE } from "../constants.js";
import type { FleetStock } from "./types.js";

/**
 * Read the rolling stocks the fleet index lists: every instance of the
 * rolling-stock class its operation answers with, an instance of another
 * type left out. The index's list and the strip's count both read it, with
 * the variables the route warms the store with, so the figure and the rows
 * cannot disagree.
 *
 * @returns The rolling stocks, in the operation's order.
 * @note Impure: reads, and may fetch into, the Relay environment in
 *   context, and suspends until the store holds the operation.
 */
export default function useFleetStocks(): readonly FleetStock[] {
  const { ontologyClass } = useLazyLoadQuery<FleetIndexQuery>(
    fleetIndexQueryNode,
    { classUri: FLEET_CLASS_URI, count: FLEET_PAGE_SIZE },
  );
  return (ontologyClass?.instances.edges ?? []).flatMap(({ node }) =>
    node.__typename === "RollingStock" ? [node] : [],
  );
}

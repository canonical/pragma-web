import { prefetchQuery } from "@canonical/prism-core";
import fleetIndexQueryNode from "#relay/__generated__/FleetIndexQuery.graphql.js";
import { FLEET_CLASS_URI, FLEET_PAGE_SIZE } from "./constants.js";

/**
 * Warm the store for the fleet index: prefetch its one operation, every
 * rolling stock with its formations. The index route declares it as its
 * `warm`.
 *
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmFleetIndex(): Promise<void> {
  return prefetchQuery(fleetIndexQueryNode, {
    classUri: FLEET_CLASS_URI,
    count: FLEET_PAGE_SIZE,
  });
}

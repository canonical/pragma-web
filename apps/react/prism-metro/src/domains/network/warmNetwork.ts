import { prefetchQuery } from "@canonical/prism-core";
import networkMapQueryNode from "#relay/__generated__/NetworkMapQuery.graphql.js";
import buildNetworkMapVariables from "./buildNetworkMapVariables.js";

/**
 * Warm the store for the network map: every line, route, call and diagram
 * position the map draws.
 *
 * @returns A promise that settles when the store holds the map's data, at
 *   once when no environment is published or the store already holds it.
 * @note Impure: reads the module-level prefetch environment and performs a
 *   network request through it.
 */
export default function warmNetwork(): Promise<void> {
  return prefetchQuery(networkMapQueryNode, buildNetworkMapVariables());
}

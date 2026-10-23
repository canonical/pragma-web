import { prefetchQuery } from "@canonical/prism-core";
import buildHomeVariables from "./buildHomeVariables.js";
import { homeQueryNode } from "./homeQuery.js";

/**
 * Warm the store for the landing: prefetch `MetroHomeQuery` with the
 * landing's variables. The home route declares it as its `warm`.
 *
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmHome(): Promise<void> {
  return prefetchQuery(homeQueryNode, buildHomeVariables());
}

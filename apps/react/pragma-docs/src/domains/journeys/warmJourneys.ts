import { prefetchQuery } from "@canonical/prism-core";
import {
  journeysExplorerQueryNode,
  journeysExplorerVariables,
  readJobParam,
} from "./journeysQuery.js";

/**
 * Warm the store for the journeys explorer: prefetch the explorer's one
 * operation, with the selected job when the URL names one
 * (`/journeys/:job`) and without it otherwise (`/journeys`).
 *
 * @param params - The matched route params, carrying the percent-decoded
 *   `job` when present.
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmJourneys(
  params: Readonly<Record<string, unknown>>,
): Promise<void> {
  return prefetchQuery(
    journeysExplorerQueryNode,
    journeysExplorerVariables(readJobParam(params)),
  );
}

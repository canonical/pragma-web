import { prefetchQuery } from "@canonical/prism-core";
import {
  definitionsExplorerQueryNode,
  definitionsExplorerVariables,
  readTermParam,
} from "./definitionsQuery.js";

/**
 * Warm the store for the definitions explorer: prefetch the explorer's one
 * operation, with the selected term when the URL names one
 * (`/definitions/:term`) and without it otherwise (`/definitions`).
 *
 * @param params - The matched route params, carrying the percent-decoded
 *   `term` when present.
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmDefinitions(
  params: Readonly<Record<string, unknown>>,
): Promise<void> {
  return prefetchQuery(
    definitionsExplorerQueryNode,
    definitionsExplorerVariables(readTermParam(params)),
  );
}

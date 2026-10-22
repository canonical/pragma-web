import { prefetchQuery } from "@canonical/prism-core";
import {
  standardsIndexQueryNode,
  standardsIndexVariables,
} from "./standardsIndexQuery.js";

/**
 * Warm the store for the standards index: prefetch the first page of the
 * bound standards class with the variables the index page reads.
 *
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmStandardsIndex(): Promise<void> {
  return prefetchQuery(standardsIndexQueryNode, standardsIndexVariables());
}

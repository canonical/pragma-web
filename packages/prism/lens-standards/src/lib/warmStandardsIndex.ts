import { prefetchQuery } from "@canonical/prism-core";
import {
  buildStandardsIndexVariables,
  standardsIndexQueryNode,
} from "./standardsIndexQuery.js";
import type { StandardsBinding } from "./types.js";

/**
 * Warm the store for the standards index: prefetch the first page of the
 * bound class's instances with the variables the index page reads.
 *
 * @param binding - The class the site binds the lens to.
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmStandardsIndex(
  binding: StandardsBinding,
): Promise<void> {
  return prefetchQuery(
    standardsIndexQueryNode,
    buildStandardsIndexVariables(binding.classUri),
  );
}

import { prefetchQuery } from "@canonical/prism-core";
import {
  componentEntityQueryNode,
  componentEntityVariables,
} from "./entityQuery.js";

/**
 * Warm the store for one component's entity page: prefetch the entity named
 * by the matched `:uri` param with the variables the page reads.
 *
 * @param params - The matched route params, carrying the percent-decoded
 *   `uri`.
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmComponentEntity(
  params: Readonly<Record<string, unknown>>,
): Promise<void> {
  return prefetchQuery(
    componentEntityQueryNode,
    componentEntityVariables(params),
  );
}

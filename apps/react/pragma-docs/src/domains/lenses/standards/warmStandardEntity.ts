import { prefetchQuery } from "#relay";
import {
  standardEntityQueryNode,
  standardEntityVariables,
} from "./standardEntityQuery.js";

/**
 * Warm the store for one standard's reading page: prefetch the entity named
 * by the matched `:uri` param with the variables the page reads.
 *
 * @param params - The matched route params, carrying the percent-decoded
 *   absolute IRI as `uri`.
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmStandardEntity(
  params: Readonly<Record<string, unknown>>,
): Promise<void> {
  return prefetchQuery(
    standardEntityQueryNode,
    standardEntityVariables(params),
  );
}

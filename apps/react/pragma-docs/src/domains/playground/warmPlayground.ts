import { prefetchQuery } from "#relay";
import {
  componentProbeQueryNode,
  componentProbeVariables,
} from "./probeQuery.js";

/**
 * Warm the store for the playground: prefetch the component probe with the
 * variables the probe reads.
 *
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmPlayground(): Promise<void> {
  return prefetchQuery(componentProbeQueryNode, componentProbeVariables());
}

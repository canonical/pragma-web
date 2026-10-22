import { DEFAULT_LENS_FILTER } from "../src/lib/constants.js";
import type { LensFilter } from "../src/lib/types.js";

/**
 * Build the default filter with every given prefix lit, the state a filter
 * reaches once the chips name each ontology. Order-preserving, so two calls
 * with the same input are equal.
 */
export default function createAllNamespacesFilter(
  prefixes: readonly string[],
): LensFilter {
  return { ...DEFAULT_LENS_FILTER, namespaces: [...prefixes] };
}

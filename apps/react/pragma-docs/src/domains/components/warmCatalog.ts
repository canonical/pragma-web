import { prefetchQuery } from "#relay";
import {
  componentsCatalogQueryNode,
  componentsCatalogVariables,
} from "./catalogQuery.js";

/**
 * Warm the store for the components catalog: prefetch its first page with
 * the variables the catalog page reads.
 *
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmCatalog(): Promise<void> {
  return prefetchQuery(
    componentsCatalogQueryNode,
    componentsCatalogVariables(),
  );
}

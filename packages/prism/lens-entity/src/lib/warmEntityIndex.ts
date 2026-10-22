import { type EntityBinding, prefetchQuery } from "@canonical/prism-core";
import entityIndexQueryNode from "../__generated__/EntityIndexQuery.graphql.js";
import buildEntityIndexVariables from "./buildEntityIndexVariables.js";

/**
 * Warm the store for a binding's index: prefetch the index's one operation,
 * the first page of the class's instances. The index route declares it as
 * its `warm`.
 *
 * @param binding - The binding whose class the index lists.
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmEntityIndex(binding: EntityBinding): Promise<void> {
  return prefetchQuery(
    entityIndexQueryNode,
    buildEntityIndexVariables(binding),
  );
}

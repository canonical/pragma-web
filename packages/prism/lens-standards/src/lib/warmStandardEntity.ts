import { prefetchQuery } from "@canonical/prism-core";
import {
  buildStandardEntityVariables,
  readUriParam,
  standardEntityQueryNode,
} from "./standardEntityQuery.js";
import type { StandardsBinding } from "./types.js";

/**
 * Warm the store for one standard's reading page: prefetch the standard the
 * matched `:uri` param names, with the variables the page reads.
 *
 * @param binding - The class the site binds the lens to.
 * @param params - The matched route params, carrying the percent-decoded
 *   absolute IRI as `uri`.
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @throws When `uri` is missing, empty or not a string.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmStandardEntity(
  binding: StandardsBinding,
  params: Readonly<Record<string, unknown>>,
): Promise<void> {
  return prefetchQuery(
    standardEntityQueryNode,
    buildStandardEntityVariables(binding.classUri, readUriParam(params)),
  );
}

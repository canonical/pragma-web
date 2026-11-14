import {
  prefetchQuery,
  type ViewSearch,
  warmPageRenderer,
} from "@canonical/prism-core";
import {
  buildStandardEntityVariables,
  readUriParam,
  standardEntityQueryNode,
} from "./standardEntityQuery.js";
import type { StandardsBinding } from "./types.js";

/**
 * Warm the store for one standard's reading page: prefetch the standard the
 * matched `:uri` param names, with the variables the page reads, and what
 * the address's page renderer reads of it, such as its Turtle.
 *
 * @param binding - The class the site binds the lens to.
 * @param params - The matched route params, carrying the percent-decoded
 *   absolute IRI as `uri`.
 * @param search - The matched view search, which selects the renderer.
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @throws When `uri` is missing, empty or not a string.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery` and `warmPageRenderer`, which read that environment at
 *   the moment of the call.
 */
export default function warmStandardEntity(
  binding: StandardsBinding,
  params: Readonly<Record<string, unknown>>,
  search: ViewSearch = {},
): Promise<void> {
  const uri = readUriParam(params);
  return Promise.all([
    prefetchQuery(
      standardEntityQueryNode,
      buildStandardEntityVariables(binding.classUri, uri),
    ),
    warmPageRenderer(uri, search),
  ]).then(() => undefined);
}

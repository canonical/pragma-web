import { type Environment, fetchQuery } from "relay-runtime";
import { getPrefetchEnvironment } from "../relay/index.js";
import { ENTITY_SOURCE_QUERY } from "../ui/EntitySource/constants.js";
import { PAGE_RENDERER_NAMES } from "./constants.js";
import type { ViewSearch } from "./types.js";

/**
 * Warm the store for the page renderer the address selects: the entity's
 * Turtle when it carries `as=turtle`, and nothing for any other renderer,
 * whose body is the page's own operation. The store answers when it already
 * holds the document. A failed request settles all the same: the page then
 * renders, and the renderer asks again on the client and says why it
 * cannot show the document.
 *
 * A route's `warm` calls it with the matched search, and with the
 * environment it read synchronously when it must first resolve the
 * entity's absolute IRI through an operation of its own.
 *
 * `import { warmPageRenderer } from "@canonical/prism-core";`
 *
 * @param uri - The entity's absolute IRI.
 * @param search - The matched address's view search.
 * @param environment - The environment to warm; the published prefetch
 *   environment when omitted.
 * @returns A promise that settles once the store holds what the renderer
 *   reads, or the request failed.
 * @note Impure: reads the prefetch environment when none is given, and
 *   sends a request through the environment's network on a cold store.
 */
export default function warmPageRenderer(
  uri: string,
  search: ViewSearch,
  environment: Environment | undefined = getPrefetchEnvironment(),
): Promise<void> {
  if (environment === undefined || search.as !== PAGE_RENDERER_NAMES.turtle) {
    return Promise.resolve();
  }
  return fetchQuery(
    environment,
    ENTITY_SOURCE_QUERY,
    { uri },
    { fetchPolicy: "store-or-network" },
  )
    .toPromise()
    .then(
      () => undefined,
      () => undefined,
    );
}

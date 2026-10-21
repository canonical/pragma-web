import { prefetchQuery } from "@canonical/prism-core";
import { lobbyQueryNode, lobbyVariables } from "./lobbyQuery.js";

/**
 * Warm the store for the Home lobby: prefetch its counted doors and
 * exemplars with the variables the lobby page reads.
 *
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmLobby(): Promise<void> {
  return prefetchQuery(lobbyQueryNode, lobbyVariables());
}

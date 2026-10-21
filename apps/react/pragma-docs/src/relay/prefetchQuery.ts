import {
  type ConcreteRequest,
  createOperationDescriptor,
  fetchQuery,
  getRequest,
  type Variables,
} from "relay-runtime";
import { getPrefetchEnvironment } from "./prefetchEnvironment.js";

/**
 * Fetch `query` with `variables` into the published prefetch environment,
 * unless that environment's store already holds the data.
 *
 * It knows nothing about routes: a route's `warm` builds the variables from
 * its own params and calls this. The environment is read synchronously, at
 * the moment of the call, and never again. A caller that awaits anything
 * before calling it reads whatever environment is published by then, which
 * on the server is none (see `prefetchEnvironment.ts`).
 *
 * - No environment published: resolves at once and fetches nothing.
 * - `environment.check(operation)` reports the data "available": resolves at
 *   once and fetches nothing. The browser router's first load runs the
 *   matched route's `warm` for the very URL the server just seeded, so
 *   without this check hydration would refetch the server-rendered page.
 * - Otherwise: fetches, resolving when the fetch completes (not on its first
 *   payload) and rejecting with the fetch's error. Errors are not
 *   swallowed. The router ignores a rejected `warm` on the client, and the
 *   server's prepare step logs one.
 *
 * Two quick calls for the same operation cost one request: relay-runtime's
 * `fetchQuery` shares an identical in-flight request per environment.
 *
 * Nothing retains the fetched operation, so its records live in the store's
 * release buffer. That covers the window between a hover and a click; the
 * server's prepare step serialises the store before anything is released.
 *
 * @param query - The compiled operation to fetch.
 * @param variables - The operation's variables, built by the same builder
 *   the page's hook uses, so the fetched data fulfils the page's read.
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: reads the module-level prefetch environment and performs a
 *   network request through it.
 */
export default function prefetchQuery(
  query: ConcreteRequest,
  variables: Variables,
): Promise<void> {
  const environment = getPrefetchEnvironment();
  if (environment === undefined) return Promise.resolve();
  const operation = createOperationDescriptor(getRequest(query), variables);
  if (environment.check(operation).status === "available") {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    fetchQuery(environment, query, variables).subscribe({
      complete: () => resolve(),
      error: (error: unknown) => reject(error),
    });
  });
}

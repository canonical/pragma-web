/**
 * The Relay environment that route `warm` hooks prefetch into, held in one
 * module-level slot (see `prefetchQuery`).
 *
 * A module-scope holder rather than React context on purpose: route `warm`
 * hooks run inside the router core, outside any React tree, so context
 * cannot reach them.
 *
 * - In the browser, `hydrateApp` publishes the one client environment right
 *   after creating it and before creating the router, because the browser
 *   router's initial load runs the matched route's `warm`. It stays
 *   published for the session.
 * - On the server, `prepareRelayData` publishes a per-request environment
 *   only while the matched route's `warm` call runs synchronously, and
 *   clears it before awaiting the result. Everywhere else on the server the
 *   slot is empty, so the `warm` hooks that the server's other static
 *   routers run while being built fetch nothing.
 *
 * The contract that makes the server half work: a `warm` reads the slot
 * synchronously when it is called. One that awaits anything first reads an
 * empty slot on the server and prefetches nothing; the render then finds a
 * cold store and fails loudly through `entry.tsx`'s rejecting fetch.
 */

import type { Environment } from "relay-runtime";

let prefetchEnvironment: Environment | undefined;

/**
 * Publish `environment` as the one `warm` hooks prefetch into, or clear the
 * slot with `undefined`.
 *
 * @param environment - The environment to publish, or `undefined` to clear.
 * @note Impure: writes module-level state shared by every caller in the
 *   module registry.
 */
export const setPrefetchEnvironment = (
  environment: Environment | undefined,
): void => {
  prefetchEnvironment = environment;
};

/**
 * Read the published environment.
 *
 * @returns The published environment, or `undefined` when none is.
 * @note Impure: reads module-level state.
 */
export const getPrefetchEnvironment = (): Environment | undefined =>
  prefetchEnvironment;

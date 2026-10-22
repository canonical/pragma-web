import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { createBrowserAdapter, createRouter } from "@canonical/router-core";
import {
  type HydrationOptions,
  hydrateRoot,
  type Root,
} from "react-dom/client";
import { resolveGraphqlUrl } from "#relay";
import type { InitialData } from "#server";
import { Shell } from "#shell";
import { appRoutes, notFoundRoute } from "../routes.js";

/**
 * Hydrate the app into `container` over the server's markup, returning the
 * created root.
 *
 * It reads the `__INITIAL_DATA__` the server embedded and seeds the browser
 * session's one Relay environment from its records, so the hydration render
 * reads the bytes the server rendered from and nothing refetches. A page
 * served without the global, as the Vite cells serve theirs, starts from a
 * cold store.
 *
 * The environment is published for the routes' `warm` before the router
 * exists: creating the browser router runs the initial load, whose `warm`
 * must already find the seeded store.
 *
 * @param container - The element the server rendered the app into.
 * @param options - Passed through to `hydrateRoot`; tests pass
 *   `onRecoverableError` to assert a mismatch-free hydration.
 * @returns The hydrated root.
 * @note Impure: reads `window`, publishes the prefetch environment and
 *   hydrates the DOM.
 */
export default function hydrateApp(
  container: Element | Document,
  options?: HydrationOptions,
): Root {
  const initialData = (
    window as Window & { readonly __INITIAL_DATA__?: InitialData }
  ).__INITIAL_DATA__;

  const relayEnvironment = createEnvironment({
    graphqlUrl: resolveGraphqlUrl(),
    records: initialData?.relay?.records,
  });

  setPrefetchEnvironment(relayEnvironment);

  const router = createRouter(appRoutes, {
    adapter: createBrowserAdapter(),
    notFound: notFoundRoute,
  });

  return hydrateRoot(
    container,
    <Shell environment={relayEnvironment} router={router} />,
    options,
  );
}

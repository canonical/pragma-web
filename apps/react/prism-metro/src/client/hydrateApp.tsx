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
import { Shell, SiteDocument } from "#lib/ui";
import { resolveGraphqlUrl } from "#relay";
import type { InitialData } from "#server";
import { appRoutes, notFoundRoute } from "../routes.js";
import createRoutableAdapter from "./createRoutableAdapter.js";

/**
 * Hydrate the whole server-rendered document, returning the created root.
 *
 * It renders the tree the server entry rendered, `SiteDocument` around
 * `Shell`, so the ids `useId` derives from the tree's shape match the
 * server's. `lang` is read off the `<html>` the server rendered, since the
 * renderer picks the locale and does not embed it; the theme comes from the
 * initial data. The head's elements are left out: React keeps the head nodes
 * the server rendered that the client does not render.
 *
 * It reads the `__INITIAL_DATA__` the server embedded and seeds the browser
 * session's one Relay environment from its records, so the hydration render
 * reads the bytes the server rendered from and nothing refetches. A page
 * served without the global, as the Vite cells serve theirs, starts from a
 * cold store.
 *
 * The environment is published for the routes' `warm` before the router
 * exists: creating the browser router runs the initial load, whose `warm`
 * must already find the seeded store. The router reads the location as the
 * server routed it, so a path that does not percent-decode hydrates the
 * not-found page the server answered it with.
 *
 * @param target - The document the server rendered.
 * @param options - Passed through to `hydrateRoot`; tests pass
 *   `onRecoverableError` to assert a mismatch-free hydration.
 * @returns The hydrated root.
 * @note Impure: reads `window`, publishes the prefetch environment and
 *   hydrates the DOM.
 */
export default function hydrateApp(
  target: Document,
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
    adapter: createRoutableAdapter(createBrowserAdapter()),
    notFound: notFoundRoute,
  });

  return hydrateRoot(
    target,
    <SiteDocument lang={target.documentElement.lang} theme={initialData?.theme}>
      <Shell environment={relayEnvironment} router={router} />
    </SiteDocument>,
    options,
  );
}

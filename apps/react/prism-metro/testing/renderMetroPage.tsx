import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { type RenderResult, render } from "@testing-library/react";
import { Shell } from "#lib/ui";
import { appRoutes, notFoundRoute } from "../src/routes.js";
import createMetroFetch from "./createMetroFetch.js";

/**
 * Render the app at `url` in the browser's shape, over the metro provider
 * executed in process: `Shell` over a memory router and an environment whose
 * every request runs against the provider, published for the routes' `warm`
 * before the router's first load. No server and no socket.
 *
 * @param url - The page to render.
 * @returns Testing Library's render result.
 * @note Impure: publishes the prefetch environment, which the caller clears
 *   after the test, and renders into the document.
 */
export default function renderMetroPage(url: string): RenderResult {
  const environment = createEnvironment({ fetchFn: createMetroFetch() });
  setPrefetchEnvironment(environment);
  return render(
    <Shell
      environment={environment}
      router={createRouter(appRoutes, {
        adapter: createMemoryAdapter(url),
        notFound: notFoundRoute,
      })}
    />,
  );
}

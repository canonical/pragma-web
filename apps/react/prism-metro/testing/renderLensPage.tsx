import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { type RenderResult, render } from "@testing-library/react";
import { Shell } from "#lib/ui";
import { appRoutes, notFoundRoute } from "../src/routes.js";

/**
 * Render the app at `url` in the browser's shape: `Shell` over a memory
 * router and an environment that reaches the graph at `graphqlUrl` over
 * HTTP, published for the routes' `warm` before the router's first load.
 *
 * @param url - The page to render.
 * @param graphqlUrl - The graph's GraphQL endpoint.
 * @returns Testing Library's render result.
 * @note Impure: publishes the prefetch environment, which the caller clears
 *   after the test, and renders into the document.
 */
export default function renderLensPage(
  url: string,
  graphqlUrl: string,
): RenderResult {
  const environment = createEnvironment({ graphqlUrl });
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

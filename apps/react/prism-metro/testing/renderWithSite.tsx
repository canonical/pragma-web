import {
  createEnvironment,
  HomesProvider,
  RouterLink,
} from "@canonical/prism-core";
import { ProjectionsProvider } from "@canonical/prism-projections";
import { HeadProvider } from "@canonical/react-head";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { Environment } from "relay-runtime";
import { metroProjectionMaps } from "#domains/metro";
import formatDocumentTitle from "../src/formatDocumentTitle.js";
import { homes } from "../src/homes.js";
import { appRoutes, notFoundRoute } from "../src/routes.js";
import createMetroFetch from "./createMetroFetch.js";

/**
 * Render `ui` inside the providers a page of the site reads: the document
 * title, a Relay environment, by default answered by the metro provider in
 * process, the
 * site's router over a memory adapter at `url`, the site's homes and its
 * projection maps.
 *
 * @param ui - What to render.
 * @param url - The address the router starts at.
 * @param environment - The Relay environment; one answered by the metro
 *   provider in process by default.
 * @returns Testing Library's render result.
 * @note Impure: renders into the document.
 */
export default function renderWithSite(
  ui: ReactElement,
  url = "/network",
  environment: Environment = createEnvironment({ fetchFn: createMetroFetch() }),
): RenderResult {
  return render(
    <HeadProvider titleTemplate={formatDocumentTitle}>
      <RelayEnvironmentProvider environment={environment}>
        <RouterProvider
          router={createRouter(appRoutes, {
            adapter: createMemoryAdapter(url),
            notFound: notFoundRoute,
          })}
        >
          <HomesProvider homes={homes}>
            <ProjectionsProvider
              LinkComponent={RouterLink}
              maps={metroProjectionMaps}
            >
              {ui}
            </ProjectionsProvider>
          </HomesProvider>
        </RouterProvider>
      </RelayEnvironmentProvider>
    </HeadProvider>,
  );
}

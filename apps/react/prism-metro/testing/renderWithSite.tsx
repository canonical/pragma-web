import { createEnvironment, HomesProvider } from "@canonical/prism-core";
import { HeadProvider } from "@canonical/react-head";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import formatDocumentTitle from "../src/formatDocumentTitle.js";
import { homes } from "../src/homes.js";
import { appRoutes, notFoundRoute } from "../src/routes.js";
import createMetroFetch from "./createMetroFetch.js";

/**
 * Render `ui` inside the providers a page of the site reads: the document
 * title, a Relay environment answered by the metro provider in process, the
 * site's router over a memory adapter at `url`, and the site's homes.
 *
 * @param ui - What to render.
 * @param url - The address the router starts at.
 * @returns Testing Library's render result.
 * @note Impure: renders into the document.
 */
export default function renderWithSite(
  ui: ReactElement,
  url = "/network",
): RenderResult {
  return render(
    <HeadProvider titleTemplate={formatDocumentTitle}>
      <RelayEnvironmentProvider
        environment={createEnvironment({ fetchFn: createMetroFetch() })}
      >
        <RouterProvider
          router={createRouter(appRoutes, {
            adapter: createMemoryAdapter(url),
            notFound: notFoundRoute,
          })}
        >
          <HomesProvider homes={homes}>{ui}</HomesProvider>
        </RouterProvider>
      </RelayEnvironmentProvider>
    </HeadProvider>,
  );
}

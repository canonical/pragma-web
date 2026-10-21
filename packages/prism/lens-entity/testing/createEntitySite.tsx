import { createStaticRouter, HomesProvider } from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { Outlet, RouterProvider } from "@canonical/router-react";
import type { ReactElement } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { EntityLayout } from "../src/lib/EntityLayout/index.js";
import { HOMES, SITE_ROUTES } from "./fixtures.js";
import type { EntitySiteSetup } from "./types.js";

/**
 * Build the lens under the provider stack a site mounts it in: a Relay
 * environment, a static router over the site's two lenses at `url`, and,
 * inside the router, the site's homes and the default projection maps, which
 * the index's rows and cards and the page's title and chip read their arms
 * and their links from. The content sits in the lens layout when one is
 * given.
 *
 * @param setup - The URL, the environment, the content and the layout.
 * @returns The site, ready to render.
 */
export default function createEntitySite({
  url,
  environment,
  children = <Outlet />,
  layout,
}: EntitySiteSetup): ReactElement {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <RouterProvider router={createStaticRouter(SITE_ROUTES, url)}>
        <HomesProvider homes={HOMES}>
          <ProjectionsProvider maps={defaultProjectionMaps}>
            {layout === undefined ? (
              children
            ) : (
              <EntityLayout
                binding={layout.binding}
                className={layout.className}
                colophon={layout.colophon}
                label={layout.label}
                rail={layout.rail ?? null}
              >
                {children}
              </EntityLayout>
            )}
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  );
}

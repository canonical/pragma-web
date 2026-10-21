import {
  createStaticRouter,
  type EntityBinding,
  HomesProvider,
} from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { Outlet, RouterProvider } from "@canonical/router-react";
import type { ReactElement, ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { Environment } from "relay-runtime";
import { EntityLayout } from "../src/lib/EntityLayout/index.js";
import { HOMES, SITE_ROUTES } from "./fixtures.js";

/** The layout `createEntitySite` wraps the content in, and the site's slots
 * it binds. */
export interface EntitySiteLayout {
  /** The binding whose routes the layout wraps. */
  readonly binding: EntityBinding;
  /** The lens's label. */
  readonly label: string;
  /** The site's rail; none when omitted. */
  readonly rail?: ReactNode;
  /** The site's footer band, if any. */
  readonly colophon?: ReactNode;
  /** Class names the site adds to the layout's root. */
  readonly className?: string;
}

/** What `createEntitySite` mounts. */
export interface EntitySiteSetup {
  /** The URL the static router matches. */
  readonly url: string;
  /** The Relay environment the site reads from. */
  readonly environment: Environment;
  /** The content; the matched route's, through the router's outlet, when
   * omitted. */
  readonly children?: ReactNode;
  /** The lens layout to wrap the content in; none when omitted. */
  readonly layout?: EntitySiteLayout;
}

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

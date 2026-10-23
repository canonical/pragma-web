import { HomesProvider, RouterLink } from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import type { AnyRoute, RouteMap, Router } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { ReactElement, ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { IEnvironment } from "relay-runtime";
import { HOMES } from "./fixtures.js";

/** What `createSiteTree` mounts. */
export interface SiteTreeOptions {
  /** The store and network the palette searches through. */
  readonly environment: IEnvironment;
  /** The site's router, which a chosen result navigates. */
  readonly router: Router<RouteMap, AnyRoute | undefined>;
  /** The content that reads the site's providers. */
  readonly children: ReactNode;
}

/**
 * Wrap `children` in the providers a site mounts above the palette: the
 * Relay environment, the router, the site's homes, and the default
 * projection maps with the router's link, so a home links through the
 * router as it does on the site.
 */
export default function createSiteTree({
  environment,
  router,
  children,
}: SiteTreeOptions): ReactElement {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <RouterProvider router={router}>
        <HomesProvider homes={HOMES}>
          <ProjectionsProvider
            LinkComponent={RouterLink}
            maps={defaultProjectionMaps}
          >
            {children}
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  );
}
